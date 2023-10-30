import loadAuthFromCookie from '@/utils/load-auth-from-cookie';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * @openapi
 * /api/puppet/{service}/clients/current:
 *   get:
 *     summary: Get current puppet client's information
 *     parameters:
 *       - name: service
 *         in: path
 *         required: true
 *         description: The service ID of clients belong to
 *         schema:
 *           type: string
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of client to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delete successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       400:
 *         description: No query condition provided
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
  const pocketbase = await loadAuthFromCookie();
  
  const id = pocketbase.authStore.model?.id;
  return NextResponse.json({userId: id});
};
