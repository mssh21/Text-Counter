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
figma.showUI(__html__, {
    width: 300,
    height: 400
});
figma.ui.onmessage = (msg) => {
    if (msg.type === 'count-text') {
        const selection = figma.currentPage.selection;
        if (selection.length === 0) {
            figma.ui.postMessage({
                type: 'count-result',
                total: 0,
                details: []
            });
            return;
        }
        // テキストノードのみを事前にフィルタリング
        const textNodes = selection.filter(node => node.type === "TEXT");
        if (textNodes.length === 0) {
            figma.ui.postMessage({
                type: 'count-result',
                total: 0,
                details: []
            });
            return;
        }
        let totalCount = 0;
        const results = [];
        // テキストノードのみを効率的に処理
        for (const textNode of textNodes) {
            const characters = textNode.characters;
            const count = characters.length;
            // 正規表現を一度だけ実行して結果を再利用
            const halfWidthSpaceMatches = characters.match(/ /g);
            const fullWidthSpaceMatches = characters.match(/　/g);
            const lineBreakMatches = characters.match(/\n/g);
            const halfWidthSpaces = halfWidthSpaceMatches ? halfWidthSpaceMatches.length : 0;
            const fullWidthSpaces = fullWidthSpaceMatches ? fullWidthSpaceMatches.length : 0;
            const lineBreaks = lineBreakMatches ? lineBreakMatches.length : 0;
            // ガイドラインチェックを実行
            const violations = checkGuidelines(characters);
            totalCount += count;
            results.push({
                name: textNode.name || "無名のテキスト",
                count: count,
                halfWidthSpaces: halfWidthSpaces,
                fullWidthSpaces: fullWidthSpaces,
                lineBreaks: lineBreaks,
                violations: violations
            });
        }
        // UIに結果を送信
        figma.ui.postMessage({
            type: 'count-result',
            total: totalCount,
            details: results
        });
    }
};
