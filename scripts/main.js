const fs = require('fs');
const path = require('path');

module.exports = {
    handleFile: async (ctx) => {
        const file = ctx.message.file;
        if (!file || !file.name.match(/\.(txt|md)$/i)) return;

        ctx.reply("⚙️ 引擎轰鸣中：正在进行全自动量子切片与剧情索引建立...");

        const content = fs.readFileSync(file.path, 'utf-8');
        const chunkSize = 120000; 
        const indexMap = [];
        
        const chapterRegex = /\s*(第[零一二三四五六七八九十百千万0-9]+[章卷回][^\n]*)/g;
        let match;
        let chapterPositions = [];
        while ((match = chapterRegex.exec(content)) !== null) {
            chapterPositions.push({ title: match[1].trim(), index: match.index });
        }

        const outDir = path.join(process.cwd(), 'game_data');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

        for (let i = 0; i < content.length; i += chunkSize) {
            const chunkContent = content.slice(i, i + chunkSize);
            const chunkName = `chunk_${(i/chunkSize + 1).toString().padStart(3, '0')}.txt`;
            
            const startPos = i;
            const endPos = i + chunkSize;
            const chaptersInChunk = chapterPositions.filter(c => c.index >= startPos && c.index < endPos);
            
            let startChap = chaptersInChunk.length > 0 ? chaptersInChunk[0].title : "未知/序章";
            let endChap = chaptersInChunk.length > 0 ? chaptersInChunk[chaptersInChunk.length - 1].title : "未知/末尾";

            indexMap.push({
                chunk_file: chunkName,
                range: `${startChap} — ${endChap}`
            });

            fs.writeFileSync(path.join(outDir, chunkName), chunkContent);
        }

        fs.writeFileSync(path.join(outDir, 'index_map.json'), JSON.stringify(indexMap, null, 2));

        ctx.reply(`✅ 万界基石构筑完成！\n📦 剧本已拆分为 ${indexMap.length} 个数据包，并生成智能索引。\n\n🎮 **请选择你的【命运模式】：**\n> 🌟 **【1. 爽文模式】**：觉醒外挂，机缘爆棚，绝对免疫死亡。\n> ⚔️ **【2. 普通模式】**：遵循原著逻辑，无外挂，存在死亡判定。\n> 💀 **【3. 苦难模式】**：地狱级难度，恶意拉满，极易死亡。\n\n**👉 请直接回复模式名称（如：“爽文模式”），准备降临！**`);
    }
};
