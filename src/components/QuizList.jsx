export default function TaskList() {
  const tasks = [
    {
      title: "Quiz 1",
      date: "Dec 9",
      files: [
        { name: "link", url: "#" },
      
      ],
    },
    {
      title: "Quiz 2",
      date: "Dec 1 (edited Dec 4)",
      files: [{ name: "link", url: "#"}],
     
    },
    {
      title: "Quiz 3",
      date: "Dec 1",
      files: [{ name: "link", url: "#" }],
    },
  ];

  return (
    <section className="bg-zinc-900 text-white p-6 rounded-md shadow-md max-w-4xl mx-auto mt-6 space-y-4">
      {tasks.map((task, index) => (
        <a
          key={index}
          href={task.url || "#"}
          className="block border border-gray-300/90 rounded-lg p-4 hover:bg-zinc-950/50 transition-shadow shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">{task.title}</h2>
            <span className="text-sm text-white">{task.date}</span>
          </div>
          {task.files.length > 0 && (
            <ul className="list-disc list-inside text-sm text-blue-500 space-y-1">
              {task.files.map((file, i) => (
                <li key={i}>
                  <a href={file.url} className="hover:underline">
                    {file.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </a>
      ))}
    </section>
  );
}