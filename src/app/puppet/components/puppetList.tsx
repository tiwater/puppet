import { useEffect, useState } from 'react';
import { Puppet } from '@/services/puppet';

const PuppetList = () => {
  const [puppets, setPuppets] = useState<Puppet[]>([]);

  useEffect(() => {
    fetchPuppets();
  }, []);

  async function fetchPuppets() {
    const response = await fetch('/api/puppet/clients');
    const data = await response.json();
    setPuppets(data);
  }

  async function deletePuppet(id: string) {
    await fetch(`/api/puppet/client/${id}`, { method: 'DELETE' });
    fetchPuppets();
  }

  return (
    <div className="flex flex-col p-2 gap-2 items-center">
      <table className="w-full bg-gray-800 rounded-md">
        <thead>
          <tr>
            <th>Client ID</th>
            <th>State</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {puppets.map((puppet) => (
            <tr key={puppet.clientId}>
              <td>{puppet.clientId}</td>
              <td>{puppet.state}</td>
              <td>
                <button
                  onClick={() => deletePuppet(puppet.clientId)}
                  className="bg-primary text-white px-2 py-1 rounded"
                >
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={fetchPuppets} className="bg-primary text-white px-2 py-1 rounded">刷新连接状态</button>
      </div>
    </div>
  );
};

export default PuppetList;
