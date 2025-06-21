import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auto-Order API',
      version: '1.0.0',
      description: 'API documentation for Auto-Order backend - Personal Purchase Tracker with CRUD operations for Products and Orders, plus purchase prediction capabilities.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Google ID Token as Bearer token'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, 'routes/products.ts'),
    path.join(__dirname, 'routes/orders.ts'),
    path.join(__dirname, 'routes/predictions.ts'),
    path.join(__dirname, 'routes/auth.ts'),
    path.join(__dirname, 'index.ts')
  ], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  // Register JSON endpoint BEFORE the UI middleware
  app.get('/api/docs/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  // Debug: log the swagger spec to see what's generated
  console.log('Swagger spec paths:', Object.keys((swaggerSpec as any).paths || {}));
  console.log('Swagger spec components:', Object.keys((swaggerSpec as any).components?.schemas || {}));
  
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Export the spec for generating static files
export { swaggerSpec };
