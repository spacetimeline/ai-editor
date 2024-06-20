import {BubbleMenuItem} from "../../types.ts";
import {t} from "i18next";

export const Code = {
    id: "code",
    title: t("code"),
    content: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M23 11.9998L15.9289 19.0708L14.5147 17.6566L20.1716 11.9998L14.5147 6.34292L15.9289 4.92871L23 11.9998ZM3.82843 11.9998L9.48528 17.6566L8.07107 19.0708L1 11.9998L8.07107 4.92871L9.48528 6.34292L3.82843 11.9998Z\"></path></svg>",
    onClick: (editor) => {
        editor.chain().toggleCode().run();
    }
} as BubbleMenuItem;