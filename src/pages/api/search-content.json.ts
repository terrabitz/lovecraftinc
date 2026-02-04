import { getAllSearchableContent } from '../../utils/searchContent';

export async function GET() {
  const content = await getAllSearchableContent();
  return new Response(JSON.stringify(content));
}
