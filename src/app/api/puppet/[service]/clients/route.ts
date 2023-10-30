import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { PUPPET_SOCKET_PATH, ControllerEvent } from '@/types/puppet-event';
import { Puppet } from '@/services/puppet';
import { loadAuthFromAllChannels } from '@/utils/load-auth-from-cookie';
import { getUserInfoList } from '@/utils/pocketbase';

// Avoid the build timeout
export const dynamic = 'force-dynamic';

/**
 * @openapi
 * /api/puppet/{service}/clients:
 *   get:
 *     summary: Get connected puppets list
 *     parameters:
 *       - name: service
 *         in: path
 *         required: true
 *         description: The service ID of clients belong to
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of puppets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Puppet'
 *       400:
 *         description: No query condition provided
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest, { params }: { params: { service: string } }) {


  const { service } = params;
  const url = process.env.NEXT_PUBLIC_TITAN_SERVICE || 'http://localhost:7000';
  const socket: Socket = socketIOClient(url, {
    path: PUPPET_SOCKET_PATH
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      socket.timeout(5000).emit(ControllerEvent.listPuppets, service, async (err: any, puppets: Puppet[]) => {
        if(err){
          resolve(new NextResponse(`Request error: ${err}`, { status: 500 }));
        } else {
          try {
            const pb = await loadAuthFromAllChannels(req.headers);
            const userId = pb.authStore?.model?.id;
            if (userId) {

              const users = await getUserInfoList(puppets.map((p) => p.clientId));
              
              const combinedArray = users.flatMap(user =>
                puppets
                  .filter(puppet => puppet.clientId === user.id)
                  .map(puppet => ({ user, puppet }))
              );
  
              const response = NextResponse.json(combinedArray);
              socket.disconnect();
              resolve(response);
            } else {
              resolve(new NextResponse(`User not authenticated`, { status: 404 }));
            }
          } catch (error: any) {
            resolve(new NextResponse(`Request error: ${error}`, { status: 500 }));
          }
        }
      });
    });

    // Handle socket error (optional)
    socket.on('error', (error) => {
      resolve(new NextResponse(`Socket error: ${error}`, { status: 500 }));
    });
  });
}
