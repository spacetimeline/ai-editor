import {AbstractBubbleMenu} from "../AbstractBubbleMenu.ts";
import {EditorEvents, isNodeSelection, posToDOMRect} from "@tiptap/core";
import {t} from "i18next";
import tippy, {Instance} from "tippy.js";
import {AiModelManager} from "../../ai/AiModelManager.ts";
import {AiEditorOptions, InnerEditor} from "../../core/AiEditor.ts";
import {Svgs} from "../../commons/Svgs.ts";
import {AiClient} from "../../ai/core/AiClient.ts";


export class TextSelectionBubbleMenu extends AbstractBubbleMenu {

    private _instance?: Instance;
    private aiBubbleInstance?: Instance;
    private bubblePanelEnable = true;
    private aiClient?: AiClient | null;

    constructor() {
        super();
        this.items = [
            {
                id: "ai",
                title: t("ai"),
                content: `
                <div style="display: flex;height: 20px">
                     <div style="line-height: 20px"> AI </div>
                     <div style="width: 18px;height: 18px;display: inline-block" >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 14L8 10H16L12 14Z"></path></svg>
                     </div>
                 </div>
                `,
            },
            {
                id: "bold",
                title: t("bold"),
                content: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M8 11H12.5C13.8807 11 15 9.88071 15 8.5C15 7.11929 13.8807 6 12.5 6H8V11ZM18 15.5C18 17.9853 15.9853 20 13.5 20H6V4H12.5C14.9853 4 17 6.01472 17 8.5C17 9.70431 16.5269 10.7981 15.7564 11.6058C17.0979 12.3847 18 13.837 18 15.5ZM8 13V18H13.5C14.8807 18 16 16.8807 16 15.5C16 14.1193 14.8807 13 13.5 13H8Z\"></path></svg>",
            },
            {
                id: "italic",
                title: t("italic"),
                content: " <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z\"></path></svg>"
            },
            {
                id: "underline",
                title: t("underline"),
                content: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M8 3V12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12V3H18V12C18 15.3137 15.3137 18 12 18C8.68629 18 6 15.3137 6 12V3H8ZM4 20H20V22H4V20Z\"></path></svg>"
            },
            {
                id: "strike",
                title: t("strike"),
                content: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M17.1538 14C17.3846 14.5161 17.5 15.0893 17.5 15.7196C17.5 17.0625 16.9762 18.1116 15.9286 18.867C14.8809 19.6223 13.4335 20 11.5862 20C9.94674 20 8.32335 19.6185 6.71592 18.8555V16.6009C8.23538 17.4783 9.7908 17.917 11.3822 17.917C13.9333 17.917 15.2128 17.1846 15.2208 15.7196C15.2208 15.0939 15.0049 14.5598 14.5731 14.1173C14.5339 14.0772 14.4939 14.0381 14.4531 14H3V12H21V14H17.1538ZM13.076 11H7.62908C7.4566 10.8433 7.29616 10.6692 7.14776 10.4778C6.71592 9.92084 6.5 9.24559 6.5 8.45207C6.5 7.21602 6.96583 6.165 7.89749 5.299C8.82916 4.43299 10.2706 4 12.2219 4C13.6934 4 15.1009 4.32808 16.4444 4.98426V7.13591C15.2448 6.44921 13.9293 6.10587 12.4978 6.10587C10.0187 6.10587 8.77917 6.88793 8.77917 8.45207C8.77917 8.87172 8.99709 9.23796 9.43293 9.55079C9.86878 9.86362 10.4066 10.1135 11.0463 10.3004C11.6665 10.4816 12.3431 10.7148 13.076 11H13.076Z\"></path></svg>"
            },
            {
                id: "code",
                title: t("code"),
                content: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M23 11.9998L15.9289 19.0708L14.5147 17.6566L20.1716 11.9998L14.5147 6.34292L15.9289 4.92871L23 11.9998ZM3.82843 11.9998L9.48528 17.6566L8.07107 19.0708L1 11.9998L8.07107 4.92871L9.48528 6.34292L3.82843 11.9998Z\"></path></svg>"
            }
        ]
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.bubblePanelEnable) {
            this.aiBubbleInstance = tippy(this.querySelector("#ai")!, {
                content: this.createAiPanelElement(),
                appendTo: this.editor!.view.dom.closest(".aie-container")!,
                placement: "bottom",
                trigger: 'click',
                interactive: true,
                arrow: false,
                getReferenceClientRect: (() => {
                    const {state, view} = this.editor!
                    const {ranges} = state.selection
                    const from = Math.min(...ranges.map(range => range.$from.pos))
                    const to = Math.max(...ranges.map(range => range.$to.pos))
                    if (isNodeSelection(state.selection)) {
                        let node = view.nodeDOM(from) as HTMLElement
                        const nodeViewWrapper = node.dataset.nodeViewWrapper ? node : node.querySelector('[data-node-view-wrapper]')
                        if (nodeViewWrapper) {
                            node = nodeViewWrapper.firstChild as HTMLElement
                        }
                        if (node) {
                            return node.getBoundingClientRect()
                        }
                    }
                    return posToDOMRect(view, from, to)
                }),
                onShow: (_) => {
                    window.setTimeout(() => _.popper.querySelector<HTMLInputElement>("#prompt")?.focus(), 0);
                }
            })
        }
    }

    onCreate(props: EditorEvents["create"], _: AiEditorOptions) {
        super.onCreate(props, _);
        const options = (this.editor as InnerEditor).userOptions;
        if (options.ai && options.ai.bubblePanelEnable === false) {
            this.bubblePanelEnable = false;
            this.items = this.items.filter(item => item.id !== "ai");
        }
    }


    set instance(value: Instance) {
        this._instance = value;
    }

    onItemClick(_id: string): void {
        switch (_id) {
            case "ai":
                this._instance?.hide();
                break
            case "bold":
                this.editor?.chain().toggleBold().run();
                break;
            case "italic":
                this.editor?.chain().toggleItalic().run();
                break;
            case "underline":
                this.editor?.chain().toggleUnderline().run();
                break;
            case "strike":
                this.editor?.chain().toggleStrike().run();
                break;
            case "code":
                this.editor?.chain().toggleCode().run();
                break;
        }

    }

    onTransaction(_: EditorEvents["transaction"]): void {
    }

    private createAiPanelElement() {
        const container = document.createElement("div");
        container.classList.add("aie-ai-panel")
        container.innerHTML = `
        <div class="aie-ai-panel-body">
            <div class="aie-ai-panel-body-content" style="display: none"><div class="loader">${Svgs.refresh}</div><textarea readonly></textarea></div>
            <div class="aie-ai-panel-body-input"><input id="prompt" placeholder="告诉 AI 下一步应该如何？比如：帮我翻译成英语" type="text" />
            <button type="button" id="go" style="width: 30px;height: 30px">${Svgs.aiPanelStart}</button></div>
            <div class="aie-ai-panel-body-tips"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 17C9 17 16 18 19 21H20C20.5523 21 21 20.5523 21 20V13.937C21.8626 13.715 22.5 12.9319 22.5 12C22.5 11.0681 21.8626 10.285 21 10.063V4C21 3.44772 20.5523 3 20 3H19C16 6 9 7 9 7H5C3.89543 7 3 7.89543 3 9V15C3 16.1046 3.89543 17 5 17H6L7 22H9V17ZM11 8.6612C11.6833 8.5146 12.5275 8.31193 13.4393 8.04373C15.1175 7.55014 17.25 6.77262 19 5.57458V18.4254C17.25 17.2274 15.1175 16.4499 13.4393 15.9563C12.5275 15.6881 11.6833 15.4854 11 15.3388V8.6612ZM5 9H9V15H5V9Z" fill="currentColor"></path></svg>
            提示：您可以在上面输入文字或者选择下方的操作</div>
        </div>
        <div class="aie-ai-panel-footer" style="display: none">
        <div class="aie-ai-panel-footer-tips">您可以进行以下操作:</div>
        <p id="insert"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 18H12V20H2V18ZM2 11H22V13H2V11ZM2 4H22V6H2V4ZM18 18V15H20V18H23V20H20V23H18V20H15V18H18Z" fill="currentColor"></path></svg> 追加</p>
        <p id="replace"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.071 4.92902L11.4852 6.34323L6.82834 11.0001L16.0002 11.0002L16.0002 13.0002L6.82839 13.0001L11.4852 17.6569L10.071 19.0712L2.99994 12.0001L10.071 4.92902ZM18.0001 19V5.00003H20.0001V19H18.0001Z" fill="currentColor"></path></svg> 替换</p>
        <hr/>
        <p id="hide"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 4V6H15V4H9Z" fill="currentColor"></path></svg> 放弃</p>
        </div>
        `;

        container.querySelector("#replace")!.addEventListener("click", () => {
            const textarea = container.querySelector("textarea")!;
            if (textarea.value) {
                const {state: {selection, tr}, view: {dispatch}, schema} = this.editor!
                const textNode = schema.text(textarea.value);
                dispatch(tr.replaceRangeWith(selection.from, selection.to, textNode))
            }
        });

        container.querySelector("#insert")!.addEventListener("click", () => {
            const textarea = container.querySelector("textarea")!;
            if (textarea.value) {
                const {state: {selection, tr}, view: {dispatch}} = this.editor!
                dispatch(tr.insertText(textarea.value, selection.to))
            }
        });

        container.querySelector("#hide")!.addEventListener("click", () => {
            this.aiBubbleInstance?.hide();
            this._instance?.show();
        });

        container.querySelector("#go")!.addEventListener("click", () => {
            if (this.aiClient) {
                this.aiClient.stop();
            } else {
                const textarea = container.querySelector("textarea")!;
                textarea.value = "";
                const {selection, doc} = this.editor!.state
                const selectedText = doc.textBetween(selection.from, selection.to);
                const options = (this.editor as InnerEditor).userOptions;
                const aiModel = AiModelManager.get(options.ai?.bubblePanelModel || "spark");
                if (aiModel) {
                    const prompt = (container.querySelector("#prompt") as HTMLInputElement).value
                    const menu = this;
                    aiModel.chat(selectedText, prompt, {
                        onStart(aiClient) {
                            menu.aiClient = aiClient;
                            container.querySelector<HTMLElement>(".loader")!.style.display = "block";
                            container.querySelector<HTMLElement>(".aie-ai-panel-body-content")!.style.display = "block";
                            container.querySelector("#go")!.innerHTML = Svgs.aiPanelStop;
                        },
                        onStop() {
                            menu.aiClient = null;
                            container.querySelector("#go")!.innerHTML = Svgs.aiPanelStart;
                            container.querySelector<HTMLElement>(".loader")!.style.display = "none";
                            container.querySelector<HTMLElement>(".aie-ai-panel-footer")!.style.display = "block";
                        },
                        onMessage(message) {
                            textarea!.value = textarea?.value + message.content;
                        }
                    })

                } else {
                    console.error("Ai model config error.")
                }
            }


        });

        return container;
    }
}



