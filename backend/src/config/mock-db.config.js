// Mock database for testing without PostgreSQL
const contacts = new Map();
let nextId = 1;

const mockPrisma = {
  contact: {
    async findMany(options) {
      const allContacts = Array.from(contacts.values());
      
      if (options.where?.OR) {
        return allContacts.filter(contact => {
          return options.where.OR.some(condition => {
            if (condition.email && contact.email === condition.email) return true;
            if (condition.phoneNumber && contact.phoneNumber === condition.phoneNumber) return true;
            return false;
          });
        });
      }
      
      return allContacts;
    },
    
    async findUnique(options) {
      return contacts.get(options.where.id) || null;
    },
    
    async create(options) {
      const contact = {
        id: nextId++,
        ...options.data,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      };
      contacts.set(contact.id, contact);
      return contact;
    },
    
    async update(options) {
      const contact = contacts.get(options.where.id);
      if (contact) {
        Object.assign(contact, options.data, { updatedAt: new Date() });
        contacts.set(contact.id, contact);
      }
      return contact;
    },
    
    async updateMany(options) {
      const updatedContacts = [];
      for (const contact of contacts.values()) {
        if (options.where.linkedId && contact.linkedId === options.where.linkedId) {
          Object.assign(contact, options.data, { updatedAt: new Date() });
          updatedContacts.push(contact);
        }
      }
      return { count: updatedContacts.length };
    },
    
    async count() {
      return contacts.size;
    }
  },
  
  async $connect() {
    console.log('🔗 Connected to mock database');
  },
  
  async $disconnect() {
    console.log('📦 Disconnected from mock database');
  }
};

module.exports = { mockPrisma };
