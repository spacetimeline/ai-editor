import {BubbleMenuItem} from "../../types.ts";
import {t} from "i18next";

export const Italic = {
    id: "italic",
    title: t("italic"),
    content: " <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M15 20H7V18H9.92661L12.0425 6H9V4H17V6H14.0734L11.9575 18H15V20Z\"></path></svg>",
    onClick: (editor) => {
        editor.chain().toggleItalic().run();
    }
} as BubbleMenuItem;