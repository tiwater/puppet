import { useEffect, useState } from 'react';
import { Puppet } from '@/services/puppet';
import { WebSocketServiceType } from '@/types/websocket';
import { UserInfo } from '@/types/user';
import { PuppetLoginStatus } from '@/types/puppet-event';

const PuppetList = () => {
  const [puppets, setPuppets] = useState<{user: UserInfo, puppet: Puppet}[]>([]);

  useEffect(() => {
    fetchPuppets();
  }, []);

  async function fetchPuppets() {
    const response = await fetch(`/api/puppet/${WebSocketServiceType.ZionSupport}/clients`);
    if(response.ok){
      const data = await response.json();
      setPuppets(data);
    } else {
      console.error(`Error because of ${response.statusText}`);
    }
  }

  async function deletePuppet(id: string) {
    await fetch(`/api/puppet/${WebSocketServiceType.ZionSupport}/clients/${id}`, { method: 'DELETE' });
    fetchPuppets();
  }

  return (
    <div className="flex flex-col p-2 gap-2 items-center">
    <table className="w-full bg-gray-800 rounded-md">
      <thead>
        <tr>
          <th className="text-center">Penless Account</th>
          <th className="text-center">State</th>
          <th className="text-center">IM Account</th>
          <th className="text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {
          puppets.map((puppet) => (
            <tr key={puppet.user.id}>
              <td className="text-center">{puppet.user.name ?? puppet.user.username}</td>
              <td className="text-center">{puppet.puppet.state}</td>
              <td className="text-center">{puppet.puppet.state == PuppetLoginStatus.login ? 
                `${puppet.puppet.user?.payload?.name} (${puppet.puppet.user?.payload?.handle})`
                : ''}
              </td>
              <td className="text-center">
                <button
                  onClick={() => deletePuppet(puppet.user.id)}
                  className="bg-primary text-white px-2 py-1 rounded"
                >
                  退出
                </button>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
    <div>
      <button onClick={fetchPuppets} className="bg-primary text-white px-2 py-1 rounded">刷新连接状态</button>
    </div>
  </div>
  );
};

export default PuppetList;
