const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Voluntariado IFRS',
      version: '1.0.0',
      description: 'Gerenciamento de voluntários e eventos sociais.',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Campanha de Doação de Sangue' },
            description: { type: 'string', nullable: true, example: 'Parceria com o hemocentro' },
            event_date: { type: 'string', example: '2026-11-10' },
            location: { type: 'string', example: 'Ginásio do IFRS' },
            max_volunteers: { type: 'integer', example: 3 },
            enrolled: { type: 'integer', example: 1 },
          },
        },
        EventInput: {
          type: 'object',
          required: ['title', 'event_date', 'location'],
          properties: {
            title: { type: 'string', example: 'Campanha do Agasalho' },
            description: { type: 'string', example: 'Arrecadação de roupas de inverno' },
            event_date: { type: 'string', example: '2026-12-15' },
            location: { type: 'string', example: 'Hall de entrada' },
            max_volunteers: { type: 'integer', example: 8 },
          },
        },
        Volunteer: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Ana Souza' },
            email: { type: 'string', example: 'ana@email.com' },
            phone: { type: 'string', nullable: true, example: '54999990001' },
          },
        },
        VolunteerInput: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', example: 'Diego Alves' },
            email: { type: 'string', example: 'diego@email.com' },
            phone: { type: 'string', example: '54999990004' },
          },
        },
        Error: {
          type: 'object',
          properties: { message: { type: 'string', example: 'Evento não encontrado' } },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
});
