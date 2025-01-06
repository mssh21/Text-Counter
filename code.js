"use strict";
const writingGuidelines = [
    {
        pattern: /[ｦ-ﾟ]/g,
        message: "半角カナは使用せず、全角カタカナを使用してください"
    },
    {
        pattern: /[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
        message: "サロゲート文字（絵文字など）は使用しないでください"
    }
];
function checkGuidelines(text) {
    const violations = [];
    writingGuidelines.forEach(rule => {
        if (rule.pattern.test(text)) {
            violations.push(rule.message);
        }
    });
    return violations;
}
figma.showUI(__html__, { width: 300, height: 400 });
figma.ui.onmessage = (msg) => {
    if (msg.type === 'count-text') {
        const selection = figma.currentPage.selection;
        let totalCount = 0;
        let results = [];
        // 選択したレイヤーをループで処理
        for (const node of selection) {
            if (node.type === "TEXT") {
                const characters = node.characters;
                const count = characters.length;
                const halfWidthSpaces = (characters.match(/ /g) || []).length;
                const fullWidthSpaces = (characters.match(/　/g) || []).length;
                const lineBreaks = (characters.match(/\n/g) || []).length;
                // ガイドラインチェックを実行
                const violations = checkGuidelines(characters);
                totalCount += count;
                results.push({
                    name: node.name || "無名のテキスト",
                    count: count,
                    halfWidthSpaces: halfWidthSpaces,
                    fullWidthSpaces: fullWidthSpaces,
                    lineBreaks: lineBreaks,
                    violations: violations
                });
            }
        }
        // UIに結果を送信
        figma.ui.postMessage({
            type: 'count-result',
            total: totalCount,
            details: results
        });
    }
};
