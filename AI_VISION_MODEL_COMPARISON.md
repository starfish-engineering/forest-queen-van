# AI Vision Model Comparison for Van Build Gallery (2025)

## Quick Recommendation

**🏆 Winner: Claude 4.5 Sonnet**
- Best for technical/construction images
- Most cost-effective
- Superior structured output
- Better at understanding diagrams and technical details

---

## Detailed Comparison

### Claude 4.5 Sonnet (Anthropic)

**Strengths:**
- ✅ **Superior vision for technical content** - Excels at interpreting charts, diagrams, and technical documentation
- ✅ **200K token context window** - Process 20+ images in a single API call
- ✅ **Cost-effective** - $3/1M input tokens, $15/1M output tokens
- ✅ **Structured output** - Excellent at returning clean JSON
- ✅ **Latest model** - Claude Sonnet 4.5 released recently

**Weaknesses:**
- ⚠️ Your Claude Pro Max subscription doesn't include API access
- ⚠️ Need separate Anthropic API account
- ⚠️ $5 minimum credit purchase to start

**Pricing for your project:**
```
1,500 images × 500 tokens = 750K input tokens
Output (categories + descriptions) = 300K output tokens

Input:  750K × $3/1M  = $2.25
Output: 300K × $15/1M = $4.50
Total: ~$6.75
```

**API Setup:**
```bash
# Sign up at https://console.anthropic.com
# Get API key
# $5 initial credit (enough for ~700 images)
```

---

### GPT-4o (OpenAI)

**Strengths:**
- ✅ **Multimodal** - Handles text, vision, and audio
- ✅ **Fast inference** - Quick response times
- ✅ **Widely used** - Lots of documentation and examples
- ✅ **Good vision capabilities** - Solid performance on construction images

**Weaknesses:**
- ⚠️ **More expensive** - $5/1M input ($2.50 cached), $20/1M output
- ⚠️ **Smaller context** - Can't batch as many images
- ⚠️ **Less technical** - Not as strong with technical diagrams

**Pricing for your project:**
```
1,500 images × 500 tokens = 750K input tokens
Output (categories + descriptions) = 300K output tokens

Input:  750K × $5/1M  = $3.75 (or $1.88 cached)
Output: 300K × $20/1M = $6.00
Total: ~$9.75 (or $7.88 with caching)
```

**API Setup:**
```bash
# Sign up at https://platform.openai.com
# Get API key
# $5 free credit for new accounts
```

---

### Google Gemini 2.0 Flash

**Strengths:**
- ✅ **Free tier** - 1500 requests/day free
- ✅ **Multimodal** - Native vision, audio, video
- ✅ **Fast** - Optimized for speed
- ✅ **Large context** - 1M token window

**Weaknesses:**
- ⚠️ **Rate limits** - Free tier may take multiple days
- ⚠️ **Less proven** - Newer, less tested for technical content
- ⚠️ **Structured output** - May need more prompt engineering

**Pricing:**
```
Free tier: 1500 requests/day
1,500 images = 2 days at free tier

Paid tier: $0.075/1M input, $0.30/1M output
Total: ~$0.15 (extremely cheap!)
```

---

## Recommended Approach for Your Project

### Option 1: Claude 4.5 Sonnet (RECOMMENDED)

**Best for:** Highest quality categorization and technical descriptions

**Steps:**
1. Create Anthropic account at https://console.anthropic.com
2. Purchase $5 in credits (enough for ~700 images)
3. Get API key
4. Run batch processing script
5. Top up if needed for remaining images

**Expected results:**
- Accurate technical descriptions
- Precise categorization
- Structured JSON output
- Total cost: ~$7

---

### Option 2: GPT-4o (Alternative)

**Best for:** If you already have OpenAI API access

**Steps:**
1. Use existing OpenAI account or create new
2. Get API key
3. Run batch processing script
4. Monitor costs

**Expected results:**
- Good descriptions
- Reliable categorization
- Total cost: ~$10

---

### Option 3: Gemini 2.0 Flash (Budget Option)

**Best for:** Minimizing costs, willing to wait

**Steps:**
1. Create Google AI account
2. Use free tier (1500 requests/day)
3. Process 750 images/day over 2 days
4. Zero cost!

**Expected results:**
- Decent descriptions
- Good categorization
- May need manual review/tweaking
- Total cost: $0

---

## Batch Processing Strategy

### Small Batches (Testing)
```typescript
// Test with 10 images first
const testImages = images.slice(0, 10);
const results = await analyzeImages(testImages);
// Review results, adjust prompts
// Total cost: ~$0.05
```

### Full Batch (Production)
```typescript
// Process all images in batches of 20
const batchSize = 20;
for (let i = 0; i < images.length; i += batchSize) {
  const batch = images.slice(i, i + batchSize);
  const results = await analyzeImages(batch);
  await saveResults(results);
  // Progress: `${i + batchSize}/${images.length} images processed`
}
```

### Error Handling
```typescript
// Retry failed images
const failed = results.filter(r => r.error);
const retried = await retryWithExponentialBackoff(failed);
```

---

## Sample Prompts

### Claude 4.5 Sonnet Prompt
```
You are analyzing construction photos from a DIY Ford Transit van conversion.
For each image, provide:

{
  "category": "electrical|plumbing|framing|...",
  "confidence": 0-100,
  "phase": "phase-1|phase-2|phase-3",
  "description": "Brief technical description",
  "tags": ["tag1", "tag2", ...],
  "detected_items": ["wire", "conduit", ...],
  "technical_notes": "Any visible specifications"
}

Focus on: What's being installed? What phase of construction?
Any visible technical details (wire gauge, pipe size, etc.)?
```

### GPT-4o Prompt
```
Analyze this van build construction photo.

Return JSON:
{
  "category": "electrical|plumbing|framing|hvac|solar|propane|structural|...",
  "build_phase": "phase-1|phase-2|phase-3",
  "short_description": "100 char description",
  "long_description": "Detailed technical description",
  "tags": ["relevant", "tags", "here"],
  "technical_details": "Any visible specs, measurements, brands"
}

Categories: electrical, plumbing, framing, flooring, ceiling, walls,
hvac, solar, propane, windows, cabinets, finishes, garden
```

---

## Cost Monitoring

### Set Spending Limits
```typescript
const MAX_SPEND = 10.00; // $10 limit
let currentSpend = 0;

async function analyzeWithBudget(images) {
  const estimatedCost = (images.length * 500 * 3) / 1000000; // Input
  if (currentSpend + estimatedCost > MAX_SPEND) {
    throw new Error('Budget exceeded!');
  }
  // Process...
  currentSpend += actualCost;
}
```

### Track Usage
```typescript
const usage = {
  images_processed: 0,
  tokens_input: 0,
  tokens_output: 0,
  cost_input: 0,
  cost_output: 0,
  total_cost: 0
};

// Log after each batch
console.log(`Processed: ${usage.images_processed}/1500`);
console.log(`Cost so far: $${usage.total_cost.toFixed(2)}`);
```

---

## Decision Matrix

| Factor | Claude 4.5 Sonnet | GPT-4o | Gemini 2.0 Flash |
|--------|------------------|---------|------------------|
| **Cost** | $7 | $10 | $0 |
| **Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Speed** | Fast | Fast | Free tier slow |
| **Technical accuracy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Batch size** | 20 images | 10 images | 1 image |
| **Setup** | New account | May have account | New account |
| **Free credits** | $5 minimum | $5 new accounts | 1500/day free |

---

## My Recommendation

**Start with Claude 4.5 Sonnet:**

1. **Phase 1: Small test (10 images)**
   - Cost: $0.05
   - Validate categorization accuracy
   - Refine prompts

2. **Phase 2: Medium test (100 images)**
   - Cost: $0.50
   - Check for edge cases
   - Adjust categories if needed

3. **Phase 3: Full batch (1,500 images)**
   - Cost: ~$6.25 remaining
   - Complete gallery population
   - Total spent: ~$7

**Why?**
- Best quality for technical images
- Most cost-effective per image
- Superior structured output
- Total cost still under $10

**If Claude doesn't work out:**
- Fall back to GPT-4o (slightly more expensive)
- Or use Gemini free tier (slower but $0)

---

## Next Steps

1. ✅ Review this comparison
2. ⬜ Choose your model (I recommend Claude)
3. ⬜ Create API account
4. ⬜ Get API key
5. ⬜ Share API key (encrypted) or set in .env.local
6. ⬜ Run test batch of 10 images
7. ⬜ Review results together
8. ⬜ Proceed with full batch

**Ready to proceed when you are!**
