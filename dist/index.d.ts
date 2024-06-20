import { ChainedCommands } from '@tiptap/core/dist/packages/core/src/types';
import { Editor } from '@tiptap/core';
import { EditorEvents } from '@tiptap/core';
import { EditorOptions } from '@tiptap/core';
import { Extensions } from '@tiptap/core';
import { Fragment } from 'prosemirror-model';
import { JSONContent } from '@tiptap/core';

declare class AbstractMenuButton extends HTMLElement implements AiEditorEvent {
    template: string;
    editor?: Editor;
    options?: AiEditorOptions;
    protected constructor();
    protected registerClickListener(): void;
    connectedCallback(): void;
    onClick(commands: ChainedCommands): void;
    onCreate(props: EditorEvents["create"], options: AiEditorOptions): void;
    onTransaction(event: EditorEvents["transaction"]): void;
    onActive(editor: Editor): boolean;
}

export declare interface AiClient {
    start: (payload: string) => void;
    stop: () => void;
}

export declare interface AiClientListener {
    onStart: (aiClient: AiClient) => void;
    onStop: () => void;
    onMessage: (bodyString: string) => void;
}

export declare class AiEditor {
    private customLayout;
    innerEditor: InnerEditor;
    container: HTMLDivElement;
    header: Header;
    mainEl: HTMLDivElement;
    footer: Footer;
    options: AiEditorOptions;
    eventComponents: AiEditorEvent[];
    constructor(_: AiEditorOptions);
    private initI18nAndInnerEditor;
    private initInnerEditor;
    private onCreate;
    private onTransaction;
    private onDestroy;
    getHtml(): string;
    getJson(): JSONContent;
    getText(): string;
    getSelectedText(): string;
    getMarkdown(): any;
    getOptions(): AiEditorOptions;
    getOutline(): any[];
    focus(): this;
    focusPos(pos: number): this;
    focusStart(): this;
    focusEnd(): this;
    isFocused(): boolean;
    blur(): this;
    insert(content: any): this;
    setEditable(editable: boolean): this;
    setContent(content: string): this;
    clear(): this;
    isEmpty(): boolean;
    changeLang(lang: string): this;
    removeRetention(): this;
    destroy(): void;
    isDestroyed(): boolean;
}

export declare interface AiEditorEvent {
    onCreate: (props: EditorEvents['create'], options: AiEditorOptions) => void;
    onTransaction: (props: EditorEvents['transaction']) => void;
}

export declare type AiEditorOptions = {
    element: string | Element;
    content?: string;
    contentRetention?: boolean;
    contentRetentionKey?: string;
    lang?: string;
    editable?: boolean;
    i18n?: Record<string, Record<string, string>>;
    placeholder?: string;
    theme?: "light" | "dark";
    onMentionQuery?: (query: string) => any[] | Promise<any[]>;
    onCreateBefore?: (editor: AiEditor, extensions: Extensions) => void | Extensions;
    onDestroy?: (editor: AiEditor) => void;
    onCreated?: (editor: AiEditor) => void;
    onChange?: (editor: AiEditor) => void;
    onSave?: (editor: AiEditor) => boolean;
    toolbarKeys?: (string | CustomMenu)[];
    draggable?: boolean;
    textSelectionBubbleMenu?: {
        enable?: boolean;
        elementTagName?: string;
        items?: (string)[];
    };
    link?: {
        autolink?: boolean;
        rel?: string;
        class?: string;
        bubbleMenuItems?: (string)[];
    };
    uploader?: (file: File, uploadUrl: string, headers: Record<string, any>, formName: string) => Promise<Record<string, any>>;
    image?: {
        customMenuInvoke?: (editor: AiEditor) => void;
        uploadUrl?: string;
        uploadHeaders?: (() => Record<string, any>) | Record<string, any>;
        uploadFormName?: string;
        uploader?: (file: File, uploadUrl: string, headers: Record<string, any>, formName: string) => Promise<Record<string, any>>;
        uploaderEvent?: UploaderEvent;
        defaultSize?: number | string;
        allowBase64?: boolean;
        bubbleMenuItems?: (string)[];
    };
    video?: {
        customMenuInvoke?: (editor: AiEditor) => void;
        uploadUrl?: string;
        uploadHeaders?: (() => Record<string, any>) | Record<string, any>;
        uploadFormName?: string;
        uploader?: (file: File, uploadUrl: string, headers: Record<string, any>, formName: string) => Promise<Record<string, any>>;
        uploaderEvent?: UploaderEvent;
        defaultSize?: number | string;
    };
    attachment?: {
        customMenuInvoke?: (editor: AiEditor) => void;
        uploadUrl?: string;
        uploadHeaders?: (() => Record<string, any>) | Record<string, any>;
        uploadFormName?: string;
        uploader?: (file: File, uploadUrl: string, headers: Record<string, any>, formName: string) => Promise<Record<string, any>>;
        uploaderEvent?: UploaderEvent;
    };
    fontFamily?: {
        values: NameAndValue[];
    };
    fontSize?: {
        values: NameAndValue[];
    };
    ai?: AiGlobalConfig;
};

export declare interface AiGlobalConfig {
    models: Record<string, AiModelConfig>;
    modelFactory?: AiModelFactory;
    onTokenConsume?: (modelName: string, modelConfig: AiModelConfig, count: number) => void;
    onCreateClientUrl?: (modelName: string, modelConfig: AiModelConfig, onSuccess: (url: string) => void, onFailure: () => void) => void;
    bubblePanelEnable?: boolean;
    bubblePanelModel?: string;
    menus?: AiMenu[];
    commands?: AiMenu[];
    codeBlock?: {
        codeComments?: {
            model: string;
            prompt: string;
        };
        codeExplain?: {
            model: string;
            prompt: string;
        };
    };
}

export declare interface AiMenu {
    icon: string;
    name: string;
    prompt?: string;
    text?: "selected" | "focusBefore";
    model?: string;
    children?: AiMenu[];
}

export declare interface AiMessage {
    role: string;
    content: string;
    index: number;
    status: 0 | 1 | 2;
}

export declare interface AiMessageListener {
    onStart: (aiClient: AiClient) => void;
    onStop: () => void;
    onMessage: (message: AiMessage) => void;
}

declare abstract class AiModel {
    editor: InnerEditor;
    globalConfig: AiGlobalConfig;
    aiModelName: string;
    aiModelConfig: AiModelConfig;
    protected constructor(editor: InnerEditor, globalConfig: AiGlobalConfig, aiModelName: string);
    chatWithPayload(payload: any, listener: AiMessageListener): void;
    chat(selectedText: string, prompt: string, listener: AiMessageListener): void;
    /**
     * 创建客户端链接 URL
     */
    abstract createAiClientUrl(): string;
    /**
     * 创建客户端
     */
    abstract createAiClient(url: string, listener: AiMessageListener): AiClient;
    /**
     * 封装消息，把 prompt 转换为协议需要的格式
     * @param prompt
     */
    abstract wrapPayload(prompt: string): any;
}

declare interface AiModelConfig {
}

export declare interface AiModelFactory {
    create: (name: string, editor: Editor, globalConfig: AiGlobalConfig) => AiModel;
}

export declare class AiModelManager {
    private static models;
    static init(editor: InnerEditor, globalConfig: AiGlobalConfig): void;
    static get(modelName: string): AiModel;
    static set(modelName: string, aiModel: AiModel): void;
}

export declare class CustomAiModel extends AiModel {
    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig);
    createAiClient(url: string, listener: AiMessageListener): AiClient;
    wrapPayload(promptMessage: string): string;
    createAiClientUrl(): string;
}

export declare interface CustomAiModelConfig extends AiModelConfig {
    url: (() => string) | string;
    headers?: () => Record<string, any> | undefined;
    wrapPayload: (prompt: string) => string;
    parseMessage: (bodyString: string) => AiMessage | undefined;
    protocol: "sse" | "websocket";
}

export declare interface CustomMenu {
    id?: string;
    className?: string;
    icon?: string;
    html?: string;
    tip?: string;
    onClick?: (event: MouseEvent, editor: AiEditor) => void;
    onCreate?: (button: HTMLElement, editor: AiEditor) => void;
}

declare class Footer extends HTMLElement implements AiEditorEvent {
    count: number;
    draggable: boolean;
    constructor();
    initDraggable(draggable?: boolean): void;
    updateCharacters(): void;
    onCreate(props: EditorEvents["create"], _: AiEditorOptions): void;
    onTransaction(props: EditorEvents["transaction"]): void;
}

declare class Header extends HTMLElement implements AiEditorEvent {
    menuButtons: AbstractMenuButton[];
    constructor();
    connectedCallback(): void;
    onCreate(event: EditorEvents["create"], options: AiEditorOptions): void;
    onTransaction(event: EditorEvents["transaction"]): void;
}

export declare class InnerEditor extends Editor {
    aiEditor: AiEditor;
    userOptions: AiEditorOptions;
    constructor(aiEditor: AiEditor, editorOptions: AiEditorOptions, options?: Partial<EditorOptions>);
    parseHtml(html: string): Fragment;
    parseMarkdown(markdown: string): Fragment;
}

export declare interface NameAndValue {
    name: string;
    value: any;
}

export declare class OpenaiAiModel extends AiModel {
    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig);
    createAiClient(url: string, listener: AiMessageListener): AiClient;
    wrapPayload(prompt: string): string;
    createAiClientUrl(): string;
}

export declare interface OpenaiModelConfig extends AiModelConfig {
    endpoint?: string;
    apiKey: string;
    model?: string;
}

export declare class SparkAiModel extends AiModel {
    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig);
    createAiClient(url: string, listener: AiMessageListener): AiClient;
    wrapPayload(promptMessage: string): string;
    private getDomain;
    createAiClientUrl(): string;
}

export declare interface SparkAiModelConfig extends AiModelConfig {
    appId: string;
    apiKey: string;
    apiSecret: string;
    protocol?: string;
    version?: string;
}

export declare interface UploaderEvent {
    onUploadBefore?: (file: File, uploadUrl: string, headers: Record<string, any>) => void | boolean;
    onSuccess?: (file: File, response: any) => any;
    onFailed?: (file: File, response: any) => void;
    onError?: (file: File, err: any) => void;
}

export declare class WenXinAiModel extends AiModel {
    constructor(editor: InnerEditor, globalConfig: AiGlobalConfig);
    createAiClient(url: string, listener: AiMessageListener): AiClient;
    wrapPayload(prompt: string): string;
    createAiClientUrl(): string;
}

export declare interface WenXinAiModelConfig extends AiModelConfig {
    access_token: string;
    protocol?: string;
    version?: string;
}

export { }
