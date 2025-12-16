import { createClient as createSupabaseJsClient } from './adapter';
import { createMockClient } from './mock-client';
import { Database } from '../database.types';

export const createClient = () => {
    // For QA without Docker: Force Mock
    return createMockClient();
};
