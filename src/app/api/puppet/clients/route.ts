import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { PUPPET_SOCKET_PATH, PuppetEvent, ControllerEvent } from '@/types/puppet-event';

/**
 * @openapi
 * /api/puppet/clients:
 *   get:
 *     summary: Get connected puppets list
 *     responses:
 *       200:
 *         description: An array of puppets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/EmbeddingDocumentChunk'
 *       400:
 *         description: No query condition provided
 *       500:
 *         description: Internal server error
 */
export async function GET(req: NextRequest) {
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

  // return NextResponse.json([{
  //   clientId: '1',
  //   state: 'connected',
  // }]);


  const url = process.env.NEXT_PUBLIC_TITAN_SERVICE || 'http://localhost:7000';
  const socket: Socket = socketIOClient(url, {
    path: PUPPET_SOCKET_PATH
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      socket.timeout(5000).emit(ControllerEvent.requestPuppets, (err, puppets) => {
        if(err){
          resolve(NextResponse.error(new Error(`Socket error: ${err}`)));
        } else {
          const response = NextResponse.json(puppets);
          socket.disconnect();
          resolve(response);
        }
      });
    });

    // Handle socket error (optional)
    socket.on('error', (error) => {
      resolve(NextResponse.error(new Error(`Socket error: ${error}`)));
    });
  });
}
