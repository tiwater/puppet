import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { io as socketIOClient, Socket } from 'socket.io-client';
import { PUPPET_SOCKET_PATH, PuppetEvent, ControllerEvent } from '@/types/puppet-event';


/**
 * @openapi
 * /api/puppet/{service}/clients/{id}:
 *   get:
 *     summary: Delete a specified puppet instance
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
export async function DELETE(req: NextRequest, { params }: { params: { service: string, id: string } }) {

  const { service, id } = params;

  const url = process.env.NEXT_PUBLIC_PUPPET_SERVER_URL || 'http://localhost:7000';
  const socket: Socket = socketIOClient(url, {
    path: PUPPET_SOCKET_PATH
  });

  return new Promise((resolve) => {
    socket.on('connect', () => {
      socket.timeout(5000).emit(ControllerEvent.destroyPuppet, service, id, (err: any, result: string) => {
        if(err){
          resolve(new NextResponse(`Request error: ${err}`, { status: 500 }));
        } else {
          let response;
          if(result == 'ok'){
            response = NextResponse.json({result: 'Deleted'});
          } else {
            response = new NextResponse(`Delete failed: ${result}`, { status: 500 })
          }
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