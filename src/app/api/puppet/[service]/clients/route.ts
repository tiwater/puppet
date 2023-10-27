import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { PUPPET_SOCKET_PATH, ControllerEvent } from '@/types/puppet-event';

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
  // try {
  //   const pb = await loadAuthFromAllChannels(req.headers);
  //   const userId = pb.authStore?.model?.id;
  //   if (userId) {
  //     return NextResponse.json(documents);
  //   } else {
  //     throw new Error('User not authenticated');
  //   }
  // } catch (error: any) {
  //   console.error('An error occurred:', error);
  //   return new NextResponse(`Error: ${error.message}`, { status: 500 });
  // }


  const { service } = params;
  const url = process.env.NEXT_PUBLIC_TITAN_SERVICE || 'http://localhost:7000';
  const socket: Socket = socketIOClient(url, {
    path: PUPPET_SOCKET_PATH
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      socket.timeout(5000).emit(ControllerEvent.listPuppets, service, (err: any, puppets: any) => {
        if(err){
          resolve(new NextResponse(`Request error: ${err}`, { status: 500 }));
        } else {
          const response = NextResponse.json(puppets);
          socket.disconnect();
          resolve(response);
        }
      });
    });

    // Handle socket error (optional)
    socket.on('error', (error) => {
      resolve(new NextResponse(`Socket error: ${error}`, { status: 500 }));
    });
  });
}
