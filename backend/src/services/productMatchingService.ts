import { geminiService } from './geminiService';
import { prisma } from './database';

export interface ProductMatch {
  product: {
    id: string;
    name: string;
    description?: string;
  };
  confidence: number;
  reason?: string;
}

const PRODUCT_MATCHING_PROMPT = `
You are an AI assistant that matches product descriptions to existing products.
Given a product description from a receipt and a list of existing products, find the best match.

INSTRUCTIONS:
1. Compare the new product description with existing products
2. Consider variations in naming, abbreviations, and descriptions
3. Look for semantic similarity, not just exact matches
4. Return confidence score from 0.0 to 1.0
5. If confidence is below 0.5, consider it no match

NEW PRODUCT DESCRIPTION:
{NEW_PRODUCT}

EXISTING PRODUCTS:
{EXISTING_PRODUCTS}

REQUIRED OUTPUT FORMAT (JSON only, no additional text):
{
  "bestMatch": {
    "productId": "product-id or null",
    "confidence": 0.0,
    "reason": "explanation of match or why no match"
  }
}
`;

class ProductMatchingService {
  private productCache: any[] = [];
  private cacheExpiry = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Find best matching product for a description
   */
  async findBestMatch(productDescription: string): Promise<ProductMatch | null> {
    try {
      console.log('🔍 Finding product match for:', productDescription);

      // Get existing products (with caching)
      const existingProducts = await this.getExistingProducts();
      
      if (existingProducts.length === 0) {
        console.log('📝 No existing products found, will create new product');
        return null;
      }

      // Use simple string matching for now, can enhance with LLM later
      const match = this.findSimpleMatch(productDescription, existingProducts);
      
      if (match) {
        console.log(`✅ Found match: "${productDescription}" -> "${match.product.name}" (${match.confidence})`);
        return match;
      }

      console.log('❌ No suitable match found for:', productDescription);
      return null;
    } catch (error: any) {
      console.error('❌ Error finding product match:', error);
      return null; // Return null instead of throwing to allow product creation
    }
  }

  /**
   * Find best matching product using LLM (enhanced version)
   */
  async findBestMatchWithLLM(productDescription: string): Promise<ProductMatch | null> {
    try {
      const existingProducts = await this.getExistingProducts();
      
      if (existingProducts.length === 0) {
        return null;
      }

      // Prepare products for LLM
      const productsForLLM = existingProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || ''
      }));

      const prompt = PRODUCT_MATCHING_PROMPT
        .replace('{NEW_PRODUCT}', productDescription)
        .replace('{EXISTING_PRODUCTS}', JSON.stringify(productsForLLM, null, 2));

      const result = await geminiService.generateJSON<{
        bestMatch: {
          productId: string | null;
          confidence: number;
          reason: string;
        };
      }>(prompt, {
        temperature: 0.1,
        maxOutputTokens: 512
      });

      if (!result.bestMatch.productId || result.bestMatch.confidence < 0.5) {
        return null;
      }

      const matchedProduct = existingProducts.find(p => p.id === result.bestMatch.productId);
      if (!matchedProduct) {
        return null;
      }

      return {
        product: {
          id: matchedProduct.id,
          name: matchedProduct.name,
          description: matchedProduct.description
        },
        confidence: result.bestMatch.confidence,
        reason: result.bestMatch.reason
      };
    } catch (error: any) {
      console.error('❌ Error finding LLM product match:', error);
      return null;
    }
  }

  /**
   * Simple string-based product matching
   */
  private findSimpleMatch(productDescription: string, existingProducts: any[]): ProductMatch | null {
    const normalizedDescription = this.normalizeString(productDescription);
    let bestMatch: ProductMatch | null = null;
    let bestScore = 0;

    for (const product of existingProducts) {
      const normalizedProductName = this.normalizeString(product.name);
      const normalizedProductDesc = this.normalizeString(product.description || '');

      // Calculate similarity scores
      const nameScore = this.calculateSimilarity(normalizedDescription, normalizedProductName);
      const descScore = this.calculateSimilarity(normalizedDescription, normalizedProductDesc);
      
      // Use the higher score
      const score = Math.max(nameScore, descScore);

      if (score > bestScore && score > 0.6) { // Minimum threshold
        bestScore = score;
        bestMatch = {
          product: {
            id: product.id,
            name: product.name,
            description: product.description
          },
          confidence: score,
          reason: `String similarity: ${score.toFixed(2)}`
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate string similarity using Jaccard similarity
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const set1 = new Set(str1.split(' '));
    const set2 = new Set(str2.split(' '));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Normalize string for comparison
   */
  private normalizeString(str: string): string {
    if (!str) return '';
    
    return str
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Get existing products with caching
   */
  private async getExistingProducts(): Promise<any[]> {
    const now = Date.now();
    
    if (this.productCache.length > 0 && now < this.cacheExpiry) {
      return this.productCache;
    }

    try {
      // Fetch non-draft products only
      const products = await prisma.product.findMany({
        where: { isDraft: false },
        select: {
          id: true,
          name: true,
          description: true
        },
        orderBy: { createdAt: 'desc' }
      });

      this.productCache = products;
      this.cacheExpiry = now + this.CACHE_DURATION;

      console.log(`📦 Loaded ${products.length} products for matching`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products for matching:', error);
      return [];
    }
  }

  /**
   * Clear product cache (useful when products are updated)
   */
  clearCache(): void {
    this.productCache = [];
    this.cacheExpiry = 0;
  }
}

export const productMatchingService = new ProductMatchingService(); 