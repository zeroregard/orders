import { geminiService } from './geminiService';
import { prisma } from './database';
import { productMatchingService } from './productMatchingService';
import { sanitizeEmailContent } from '../middleware/emailSecurity';

export interface ParsedReceiptItem {
  description: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  suggestedProductMatch?: string;
  matchConfidence?: number;
  suggestedNewProduct?: {
    name: string;
    description?: string;
  };
}

export interface ParsedReceipt {
  merchantName?: string;
  purchaseDate: string;
  items: ParsedReceiptItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
}

const RECEIPT_PARSING_PROMPT = `
You are an AI assistant that extracts order information from receipts and emails. 
Analyze the following email/receipt content and extract structured data.

INSTRUCTIONS:
1. Extract all purchased items with quantities and prices (if available)
2. Identify the store/merchant name
3. Extract the purchase date (use today's date if not found)
4. Return data in the specified JSON format
5. For items without clear quantities, assume quantity = 1
6. If prices are not available, set them to null
7. Clean up product names (remove SKUs, codes, etc.)
8. Focus on actual products, ignore shipping, taxes, etc. as separate items

IMPORTANT: 
- Only extract actual products/items purchased
- Ignore promotional text, shipping info, etc.
- If you can't find a clear purchase date, use today's date
- Product names should be clean and descriptive
- Quantities should be positive integers

EMAIL/RECEIPT CONTENT:
{CONTENT}

REQUIRED OUTPUT FORMAT (JSON only, no additional text):
{
  "merchantName": "Store Name or null",
  "purchaseDate": "YYYY-MM-DD",
  "items": [
    {
      "description": "Clean product name",
      "quantity": 1,
      "unitPrice": null,
      "totalPrice": null
    }
  ],
  "subtotal": null,
  "tax": null,
  "total": null,
  "currency": "USD"
}
`;

class ReceiptParsingService {
  /**
   * Parse receipt content using LLM
   */
  async parseReceipt(emailContent: string): Promise<ParsedReceipt> {
    try {
      console.log('🤖 Parsing receipt with LLM...');
      
      // Sanitize email content
      const sanitizedContent = sanitizeEmailContent(emailContent);
      
      if (!sanitizedContent.trim()) {
        throw new Error('Empty email content after sanitization');
      }

      // Prepare prompt with content
      const prompt = RECEIPT_PARSING_PROMPT.replace('{CONTENT}', sanitizedContent);
      
      // Use Gemini to parse the receipt
      const parsedData = await geminiService.generateJSON<ParsedReceipt>(prompt, {
        temperature: 0.1, // Low temperature for consistent parsing
        maxOutputTokens: 1024
      });

      // Validate parsed data
      if (!parsedData.items || !Array.isArray(parsedData.items) || parsedData.items.length === 0) {
        throw new Error('No items found in receipt');
      }

      // Ensure purchase date is valid
      if (!parsedData.purchaseDate) {
        parsedData.purchaseDate = new Date().toISOString().split('T')[0];
      }

      // Clean up items
      parsedData.items = parsedData.items.filter(item => 
        item.description && 
        item.description.trim() && 
        item.quantity > 0
      );

      if (parsedData.items.length === 0) {
        throw new Error('No valid items found after filtering');
      }

      console.log('✅ Receipt parsed successfully:', {
        merchant: parsedData.merchantName,
        itemCount: parsedData.items.length,
        date: parsedData.purchaseDate
      });

      return parsedData;
    } catch (error: any) {
      console.error('❌ Error parsing receipt:', error);
      throw new Error(`Receipt parsing failed: ${error.message}`);
    }
  }

  /**
   * Create draft order from parsed receipt
   */
  async createDraftOrder(
    parsedReceipt: ParsedReceipt,
    emailHash: string,
    senderEmail: string
  ): Promise<any> {
    try {
      console.log('📝 Creating draft order from parsed receipt...');

      // Generate order name
      const orderName = this.generateOrderName(parsedReceipt);

      // Process items and match/create products
      const processedItems = await this.processReceiptItems(parsedReceipt.items);

      // Create draft order
      const draftOrder = await prisma.order.create({
        data: {
          name: orderName,
          creationDate: new Date(),
          purchaseDate: new Date(parsedReceipt.purchaseDate),
          isDraft: true,
          source: 'EMAIL',
          originalEmailHash: emailHash,
          lineItems: {
            create: processedItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          }
        },
        include: {
          lineItems: {
            include: {
              product: true
            }
          }
        }
      });

      console.log('✅ Draft order created:', draftOrder.id);
      return draftOrder;
    } catch (error: any) {
      console.error('❌ Error creating draft order:', error);
      throw new Error(`Draft order creation failed: ${error.message}`);
    }
  }

  /**
   * Process receipt items by matching or creating products
   */
  private async processReceiptItems(items: ParsedReceiptItem[]) {
    const processedItems = [];

    for (const item of items) {
      try {
        // Try to match existing product
        const matchedProduct = await productMatchingService.findBestMatch(item.description);
        
        let productId: string;

        if (matchedProduct && matchedProduct.confidence > 0.7) {
          // Use existing product
          productId = matchedProduct.product.id;
          console.log(`🔗 Matched "${item.description}" to existing product: ${matchedProduct.product.name}`);
        } else {
          // Create new draft product
          const newProduct = await prisma.product.create({
            data: {
              name: this.cleanProductName(item.description),
              description: item.description,
              price: item.unitPrice || null,
              isDraft: true
            }
          });
          productId = newProduct.id;
          console.log(`➕ Created new draft product: ${newProduct.name}`);
        }

        processedItems.push({
          productId,
          quantity: item.quantity
        });
      } catch (error) {
        console.error('❌ Error processing item:', item.description, error);
        // Skip this item and continue
      }
    }

    return processedItems;
  }

  /**
   * Generate order name from parsed receipt
   */
  private generateOrderName(parsedReceipt: ParsedReceipt): string {
    const date = new Date(parsedReceipt.purchaseDate).toLocaleDateString();
    const merchant = parsedReceipt.merchantName || 'Unknown Store';
    return `Email Receipt - ${merchant} (${date})`;
  }

  /**
   * Clean product name by removing codes, SKUs, etc.
   */
  private cleanProductName(description: string): string {
    return description
      .replace(/\b[A-Z0-9]{6,}\b/g, '') // Remove SKUs/codes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }
}

export const receiptParsingService = new ReceiptParsingService(); 