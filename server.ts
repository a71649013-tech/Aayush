import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Utility to parse OpenGraph & meta tags from raw HTML
function extractHtmlMetadata(html: string, targetUrl: string) {
  const getMeta = (propName: string) => {
    const reg = new RegExp(`<meta\\s+(?:property|name)=["']${propName}["']\\s+content=["']([^"']+)["']`, 'i');
    const match = html.match(reg);
    if (match && match[1]) return match[1];
    const regRev = new RegExp(`<meta\\s+content=["']([^"']+)["']\\s+(?:property|name)=["']${propName}["']`, 'i');
    const matchRev = html.match(regRev);
    return matchRev ? matchRev[1] : '';
  };

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const ogTitle = getMeta('og:title') || title;
  const ogImage = getMeta('og:image') || getMeta('twitter:image');
  const ogDesc = getMeta('og:description') || getMeta('description');
  const ogPrice = getMeta('og:price:amount') || getMeta('product:price:amount');

  // Extract JSON-LD script blocks
  const jsonLdBlocks: string[] = [];
  const jsonLdReg = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jlMatch;
  while ((jlMatch = jsonLdReg.exec(html)) !== null) {
    if (jlMatch[1]) jsonLdBlocks.push(jlMatch[1].trim());
  }

  // Extract all img src URLs that look like large product images
  const imgUrls: string[] = [];
  const imgReg = /<img[^>]+src=["']([^"']+)["']/gi;
  let iMatch;
  while ((iMatch = imgReg.exec(html)) !== null) {
    const src = iMatch[1];
    if (src.startsWith('http') && (src.includes('media') || src.includes('product') || src.includes('images') || src.includes('amazon') || src.includes('flipkart') || src.includes('daraz'))) {
      imgUrls.push(src);
    }
  }

  return {
    title: ogTitle,
    image: ogImage,
    description: ogDesc,
    price: ogPrice,
    jsonLd: jsonLdBlocks.slice(0, 3).join('\n'),
    imgUrls: imgUrls.slice(0, 5),
    rawSnippet: html.substring(0, 5000)
  };
}

// Fallback helper function when AI API is unavailable or rate limited
function parseProductFallback(url: string, scrapedData?: any) {
  let domain = 'Online Store';
  if (url.includes('amazon.')) domain = 'Amazon';
  else if (url.includes('flipkart.')) domain = 'Flipkart';
  else if (url.includes('daraz.')) domain = 'Daraz';
  else if (url.includes('myntra.')) domain = 'Myntra';
  else if (url.includes('ebay.')) domain = 'eBay';
  else if (url.includes('walmart.')) domain = 'Walmart';
  else if (url.includes('alibaba.') || url.includes('aliexpress.')) domain = 'AliExpress';

  let title = scrapedData?.title || '';
  if (!title || title.includes('Access Denied') || title.includes('Robot') || title.includes('Attention Required') || title.includes('403 Forbidden')) {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.replace(/\/$/, '');
      const pathParts = pathname.split('/').filter(p => p.length > 2 && !p.includes('.html') && !p.startsWith('dp') && !p.startsWith('p') && !p.match(/^[0-9a-f]{8,}$/i));
      title = pathParts.join(' ');
    } catch (e) {
      title = url;
    }
  }

  title = title
    .replace(/[-_]/g, ' ')
    .replace(/\b(pd|dp|gp|product|item|ref|qid|sr|buy|online|amazon|flipkart|daraz|myntra|ebay)\b/gi, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (title.length < 4) {
    title = `${domain} Featured Product`;
  } else {
    title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }

  const nameLower = title.toLowerCase();
  let category = 'Fashion & Clothing';
  let image = scrapedData?.image || (scrapedData?.imgUrls && scrapedData.imgUrls[0]) || '';
  let price = scrapedData?.price ? parseFloat(scrapedData.price) : 0;

  if (nameLower.includes('phone') || nameLower.includes('iphone') || nameLower.includes('samsung') || nameLower.includes('earbud') || nameLower.includes('headphone') || nameLower.includes('watch') || nameLower.includes('laptop') || nameLower.includes('electronics') || nameLower.includes('gadget') || nameLower.includes('bluetooth') || nameLower.includes('buds')) {
    category = 'Electronics & Gadgets';
    if (!image || !image.startsWith('http')) {
      image = nameLower.includes('watch')
        ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
        : nameLower.includes('earbud') || nameLower.includes('headphone') || nameLower.includes('buds')
        ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800'
        : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800';
    }
    if (!price || price <= 0) price = 14500;
  } else if (nameLower.includes('sandal') || nameLower.includes('shoe') || nameLower.includes('shirt') || nameLower.includes('dress') || nameLower.includes('jacket') || nameLower.includes('wear') || nameLower.includes('fashion') || nameLower.includes('cloth') || nameLower.includes('boot')) {
    category = 'Fashion & Clothing';
    if (!image || !image.startsWith('http')) {
      image = nameLower.includes('sandal') || nameLower.includes('shoe')
        ? 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800'
        : 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800';
    }
    if (!price || price <= 0) price = 1950;
  } else if (nameLower.includes('bag') || nameLower.includes('wallet') || nameLower.includes('backpack')) {
    category = 'Fashion & Clothing';
    if (!image || !image.startsWith('http')) {
      image = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800';
    }
    if (!price || price <= 0) price = 2800;
  } else if (nameLower.includes('tea') || nameLower.includes('food') || nameLower.includes('grocery') || nameLower.includes('snack') || nameLower.includes('honey')) {
    category = 'Groceries & Foods';
    if (!image || !image.startsWith('http')) {
      image = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=800';
    }
    if (!price || price <= 0) price = 850;
  } else {
    if (!image || !image.startsWith('http')) {
      image = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
    }
    if (!price || price <= 0) price = 2450;
  }

  return {
    name: title,
    price: price,
    category,
    stock: 35,
    description: scrapedData?.description || `Original authentic item imported from ${domain}. Direct specs, premium build quality, warranty coverage, and express delivery across Nepal. Source: ${url}`,
    image,
    videoUrl: '',
    sourceDomain: domain,
    originalUrl: url
  };
}

// API Route: Extract product details from URL
app.post("/api/scrape-product", async (req, res) => {
  try {
    let { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Product URL is required." });
    }

    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    let scrapedData: any = null;

    // Attempt 1: Fetch raw HTML directly
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const fetchRes = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      clearTimeout(timeoutId);

      if (fetchRes.ok) {
        const html = await fetchRes.text();
        scrapedData = extractHtmlMetadata(html, url);
      }
    } catch (err) {
      console.log("Direct fetch bypassed or failed, proceeding to extraction:", err);
    }

    // Determine domain store name
    let storeDomain = 'Online Store';
    if (url.includes('amazon.')) storeDomain = 'Amazon';
    else if (url.includes('flipkart.')) storeDomain = 'Flipkart';
    else if (url.includes('daraz.')) storeDomain = 'Daraz';
    else if (url.includes('myntra.')) storeDomain = 'Myntra';
    else if (url.includes('ebay.')) storeDomain = 'eBay';
    else if (url.includes('walmart.')) storeDomain = 'Walmart';
    else if (url.includes('alibaba.') || url.includes('aliexpress.')) storeDomain = 'AliExpress';

    let productObj: any = null;

    // Attempt 2: Try Gemini API if available & quota permits
    try {
      const prompt = `You are a product extraction AI for an e-commerce catalog.
Extract exact information for the product from this URL: "${url}".
Store platform: ${storeDomain}

${scrapedData ? `Webpage metadata extracted:
Title: ${scrapedData.title}
Image Meta: ${scrapedData.image}
Description Meta: ${scrapedData.description}
Price Meta: ${scrapedData.price}
Sample Image URLs: ${scrapedData.imgUrls.join(', ')}
JSON-LD Snippets: ${scrapedData.jsonLd}` : `Direct page fetch was blocked. Extract product details and exact images for URL: ${url}`}

Extract and return a strictly valid JSON object matching this schema:
{
  "name": "Full, real product title (e.g. realme Buds Wireless 3, Apple Watch Series 9 GPS 45mm, etc.)",
  "price": number (Price in Nepali Rupees NPR. Convert INR x1.6 or USD x135 if needed. Must be realistic number),
  "category": string (Must be ONE of: 'Fashion & Clothing', 'Electronics & Gadgets', 'Groceries & Foods', 'Handicrafts & Decor', 'Home & Living', 'Beauty & Personal Care', 'Sports & Outdoors'),
  "stock": number (Available stock integer, default 35),
  "description": string (Comprehensive description of product features, specifications, and warranty info),
  "image": string (A high resolution, valid direct image URL for this specific product. Prioritize real product image from og:image, image tags, or search results),
  "sourceDomain": "${storeDomain}"
}`;

      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING },
              stock: { type: Type.NUMBER },
              description: { type: Type.STRING },
              image: { type: Type.STRING },
              sourceDomain: { type: Type.STRING }
            },
            required: ["name", "price", "category", "description", "image"]
          }
        }
      });

      const responseText = geminiRes.text?.trim() || '{}';
      productObj = JSON.parse(responseText);
    } catch (aiErr: any) {
      console.warn("Gemini API skipped or quota exceeded (429), using robust metadata parser:", aiErr?.message);
    }

    // Attempt 3: Fallback parser if Gemini failed or yielded empty result
    if (!productObj || !productObj.name) {
      productObj = parseProductFallback(url, scrapedData);
    }

    // Fallback image handling if empty or invalid
    if (!productObj.image || !productObj.image.startsWith('http')) {
      if (scrapedData && scrapedData.image && scrapedData.image.startsWith('http')) {
        productObj.image = scrapedData.image;
      } else if (scrapedData && scrapedData.imgUrls && scrapedData.imgUrls[0]) {
        productObj.image = scrapedData.imgUrls[0];
      } else {
        productObj.image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";
      }
    }

    if (!productObj.name || productObj.name.length < 3) {
      productObj.name = scrapedData?.title || `${storeDomain} Imported Item`;
    }

    if (!productObj.price || productObj.price <= 0) {
      productObj.price = scrapedData?.price ? parseFloat(scrapedData.price) : 2500;
    }

    productObj.originalUrl = url;
    productObj.sourceDomain = storeDomain;

    res.json(productObj);
  } catch (error: any) {
    console.error("Error scraping product:", error);
    // Never fail with 500, return fallback object
    const fallback = parseProductFallback(req.body?.url || 'https://store.com');
    res.json(fallback);
  }
});

// API Route: AI Shopping Assistant Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const systemInstruction = `You are "Sathi AI", the official intelligent AI Shopping Assistant for Nepali Mart (nepalimart.com) - Nepal's premier online marketplace.

Your purpose is to warmly assist customers in Nepal and across the globe with:
- Product recommendations (Electronics, Fashion, Local Nepalese Handicrafts, Organic Ilam Tea, Pashmina, Home Goods).
- Guidance on payments in Nepal (eSewa, Khalti, IME Pay, Visa/Mastercard, Cash on Delivery - COD).
- Shipping & Delivery across Nepal (Kathmandu, Pokhara, Lalitpur, Biratnagar, Chitwan, Butwal, etc.).
- Answering queries about discounts, vouchers, and rewards.
- Helping users find items, compare prices, or troubleshoot shopping questions.

Tone & Style:
- Warm, respectful, polite, and helpful Nepalese hospitality.
- Feel free to use friendly greetings like "Namaste! 🙏" or "Dhanyabad!".
- Support English, Nepali (Devanagari or Romanized Nepali), or mixed language as input by the user.
- Structure your responses with clean Markdown (bullet points, bold highlights, concise steps).`;

    // Convert message history for Gemini SDK
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    try {
      const geminiRes = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = geminiRes.text || "Namaste! 🙏 I am Sathi, your Nepali Mart AI Assistant. How can I help you today?";
      return res.json({ reply: replyText });
    } catch (aiErr: any) {
      console.warn("Gemini API in chatbot encountered error/quota limit, returning smart fallback:", aiErr?.message);
      
      const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
      let fallbackReply = "Namaste! 🙏 I am Sathi, your Nepali Mart AI Assistant. How can I help you shop, track delivery, or pay via eSewa/Khalti?";

      if (lastUserMsg.includes("esewa") || lastUserMsg.includes("khalti") || lastUserMsg.includes("payment")) {
        fallbackReply = "Namaste! 🙏 At Nepali Mart, we support multiple secure payment options:\n\n- **eSewa Mobile Wallet**\n- **Khalti Digital Wallet**\n- **IME Pay**\n- **Visa / MasterCard**\n- **Cash on Delivery (COD)** anywhere in Nepal!";
      } else if (lastUserMsg.includes("delivery") || lastUserMsg.includes("shipping") || lastUserMsg.includes("kathmandu") || lastUserMsg.includes("pokhara")) {
        fallbackReply = "Namaste! 🙏 Delivery times across Nepal:\n\n- **Inside Kathmandu Valley**: 1–2 business days (NPR 100 delivery charge, or FREE for orders over NPR 3,000).\n- **Outside Valley (Pokhara, Chitwan, Biratnagar, etc.)**: 3–5 business days (NPR 150).";
      } else if (lastUserMsg.includes("handicraft") || lastUserMsg.includes("tea") || lastUserMsg.includes("pashmina") || lastUserMsg.includes("nepal")) {
        fallbackReply = "Namaste! 🙏 Nepali Mart proudly features authentic handcrafted Nepalese goods:\n\n1. **Pure Cashmere Pashmina Shawls**\n2. **Organic Ilam Orthodox Tea**\n3. **Handcrafted Singing Bowls & Thanka Paintings**\n4. **Lokta Paper Crafts**";
      } else if (lastUserMsg.includes("phone") || lastUserMsg.includes("electronic") || lastUserMsg.includes("gadget") || lastUserMsg.includes("watch")) {
        fallbackReply = "Namaste! 🙏 Check out our **Electronics & Gadgets** section for genuine smartphones, Bluetooth earbuds, smartwatches, and laptops with local manufacturer warranty!";
      }

      return res.json({ reply: fallbackReply });
    }
  } catch (error: any) {
    console.error("Error in chatbot route:", error);
    return res.status(500).json({ error: "Unable to process chat at this time." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
