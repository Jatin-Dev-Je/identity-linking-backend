import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Direct PostgreSQL connection (alternative to Prisma)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Contact interface matching our Prisma schema
export interface Contact {
  id: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class PostgreSQLClient {
  async connect() {
    try {
      await pool.connect();
      console.log('✅ PostgreSQL connected successfully');
      return true;
    } catch (error) {
      console.error('❌ PostgreSQL connection failed:', error);
      return false;
    }
  }

  async createTables() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(255),
        email VARCHAR(255),
        linked_id INTEGER REFERENCES contacts(id),
        link_precedence VARCHAR(20) NOT NULL CHECK (link_precedence IN ('primary', 'secondary')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      );

      CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
      CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone_number);
      CREATE INDEX IF NOT EXISTS idx_contacts_linked_id ON contacts(linked_id);
    `;

    try {
      await pool.query(createTableQuery);
      console.log('✅ Database tables created successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to create tables:', error);
      return false;
    }
  }

  async findContacts(email?: string, phoneNumber?: string): Promise<Contact[]> {
    let query = 'SELECT * FROM contacts WHERE deleted_at IS NULL';
    const params: any[] = [];
    
    if (email && phoneNumber) {
      query += ' AND (email = $1 OR phone_number = $2)';
      params.push(email, phoneNumber);
    } else if (email) {
      query += ' AND email = $1';
      params.push(email);
    } else if (phoneNumber) {
      query += ' AND phone_number = $1';
      params.push(phoneNumber);
    }
    
    query += ' ORDER BY created_at ASC';

    const result = await pool.query(query, params);
    return result.rows.map(this.mapRowToContact);
  }

  async createContact(data: {
    email?: string;
    phoneNumber?: string;
    linkedId?: number;
    linkPrecedence: 'primary' | 'secondary';
  }): Promise<Contact> {
    const query = `
      INSERT INTO contacts (email, phone_number, linked_id, link_precedence)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.email || null,
      data.phoneNumber || null,
      data.linkedId || null,
      data.linkPrecedence
    ]);

    return this.mapRowToContact(result.rows[0]);
  }

  async updateContact(id: number, data: Partial<Contact>): Promise<Contact> {
    const query = `
      UPDATE contacts 
      SET linked_id = $1, link_precedence = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.linkedId,
      data.linkPrecedence,
      id
    ]);

    return this.mapRowToContact(result.rows[0]);
  }

  async updateManyContacts(linkedId: number, newLinkedId: number): Promise<number> {
    const query = `
      UPDATE contacts 
      SET linked_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE linked_id = $2
    `;
    
    const result = await pool.query(query, [newLinkedId, linkedId]);
    return result.rowCount || 0;
  }

  private mapRowToContact(row: any): Contact {
    return {
      id: row.id,
      phoneNumber: row.phone_number,
      email: row.email,
      linkedId: row.linked_id,
      linkPrecedence: row.link_precedence,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at
    };
  }

  async disconnect() {
    await pool.end();
    console.log('📦 PostgreSQL disconnected');
  }
}

export default new PostgreSQLClient();
