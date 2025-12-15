const fetch = global.fetch;

const categorizeCompanyAI = async (companyName) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) return null;

        const prompt = `
        You are a financial classification engine. Map the following company to a category:
        Company: "${companyName}"
        Categories: 
        - 'Super A': Top Tier MNCs (Google, TCS, Infosys, Microsoft, Tata, Reliance)
        - 'Cat A': Established Large Corporates
        - 'Cat B': Mid-sized, Stable
        - 'Unlisted': Unknown or Small
        
        Return ONLY the category name string. If unsure, return 'Unlisted'.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            let category = data.candidates[0].content.parts[0].text.trim().replace(/['"`]/g, '');
            // Normalize
            if (category.includes('Super A')) return 'Super A';
            if (category.includes('Cat A')) return 'Cat A';
            if (category.includes('Cat B')) return 'Cat B';
            return 'Unlisted';
        }
        return 'Unlisted';

    } catch (error) {
        console.error("AI Categorization Error:", error);
        return null;
    }
};

module.exports = { categorizeCompanyAI };
