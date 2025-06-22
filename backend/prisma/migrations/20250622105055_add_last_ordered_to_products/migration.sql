-- Add lastOrdered column to products
ALTER TABLE "products" ADD COLUMN "lastOrdered" TIMESTAMP(3);

-- Create a view to help us get the last ordered date for each product
CREATE OR REPLACE VIEW product_last_ordered AS
SELECT 
    p.id as product_id,
    MAX(o."purchaseDate") as last_ordered
FROM "products" p
LEFT JOIN "order_line_items" oli ON p.id = oli."productId"
LEFT JOIN "orders" o ON oli."orderId" = o.id
GROUP BY p.id;

-- Create a function to update lastOrdered
CREATE OR REPLACE FUNCTION update_product_last_ordered()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE "products"
    SET "lastOrdered" = (
        SELECT last_ordered
        FROM product_last_ordered
        WHERE product_id = NEW."productId"
    )
    WHERE id = NEW."productId";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update lastOrdered whenever an order line item is added/updated
CREATE TRIGGER update_product_last_ordered_trigger
AFTER INSERT OR UPDATE ON "order_line_items"
FOR EACH ROW
EXECUTE FUNCTION update_product_last_ordered();
