import { AiOutlineHtml5, AiOutlineChrome } from 'react-icons/ai';

const DemoIcon = ({ type, className }: { type: string; className: string }) => {
  const icons = {
    web: AiOutlineHtml5,
    chrome: AiOutlineChrome,
  };
  const Icon = icons[type as keyof typeof icons];
  return <Icon className={className} />;
};

export default function Home() {
  const demos = [
    {
      title: 'Wechat bot',
      type: 'web',
      description:
        'Client service as Wechat bot.',
      link: '/puppet',
    },
  ];

  return (
    <main className="flex flex-col w-full h-full items-center justify-center p-4 gap-8">
      <div className="w-full  items-center justify-center flex">
        <span className="text-3xl lg:text-5xl py-2 bg-clip-text text-transparent bg-gradient-to-r from-secondary to-primary">
          Penless Lab
        </span>
      </div>

      <div className="grid text-left gap-2 md:grid-cols-2 lg:grid-cols-3">
        {demos.map(({ title, description, type, link }) => (
          <a
            key={title}
            href={link}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-neutral-700 hover:bg-neutral-800/30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2
              className={`flex items-center mb-3 text-xl font-semibold group-hover:text-primary`}
            >
              <DemoIcon type={type} className="w-7 h-7 mr-1" />
              {title}&nbsp;
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                →
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              {description}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
