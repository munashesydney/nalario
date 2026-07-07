const fs = require('fs');
const path = require('path');

const files = [
  'components/canvas/TextEditorSheet.tsx',
  'components/canvas/ShapeEditorSheet.tsx'
];

const replacements = [
  {
    from: /className="block text-\[11px\] font-medium text-zinc-500 uppercase tracking-wider mb-1\.5"/g,
    to: 'className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2"'
  },
  {
    from: /className="block w-full text-sm border border-zinc-200 rounded-none px-2\.5 py-1\.5 bg-white text-zinc-800 focus:outline-none focus:border-zinc-400"/g,
    to: 'className="block w-full text-sm font-bold border-2 border-zinc-900 rounded-none px-2.5 py-1.5 bg-white text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors"'
  },
  {
    from: /className="w-16 text-sm border border-zinc-200 rounded-none px-1\.5 py-1 bg-white text-zinc-800 focus:outline-none focus:border-zinc-400 text-center"/g,
    to: 'className="w-16 text-sm font-bold border-2 border-zinc-900 rounded-none px-1.5 py-1 bg-white text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors text-center"'
  },
  {
    from: /"flex-1 text-xs py-1\.5 border transition-colors"/g,
    to: '"flex-1 text-xs font-bold py-1.5 border-2 transition-all rounded-none uppercase"'
  },
  {
    from: /\? "bg-pink-50 text-pink-600 border-pink-500 font-medium z-10"/g,
    to: '? "bg-pink-500 text-white border-zinc-900 shadow-[2px_2px_0px_rgba(24,24,27,1)] -translate-y-[1px] -translate-x-[1px] z-10"'
  },
  {
    from: /: "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"/g,
    to: ': "bg-white text-zinc-900 border-zinc-900 hover:bg-pink-50 hover:-translate-y-[1px] hover:-translate-x-[1px] hover:shadow-[2px_2px_0px_rgba(24,24,27,1)]"'
  },
  {
    from: /className="w-8 h-8 p-0\.5 border border-zinc-200 cursor-pointer bg-white"/g,
    to: 'className="w-8 h-8 p-0 border-2 border-zinc-900 cursor-pointer bg-white rounded-none"'
  },
  {
    from: /className="flex-1 text-sm border border-zinc-200 rounded-none px-2 py-1 bg-white text-zinc-800 font-mono focus:outline-none focus:border-zinc-400"/g,
    to: 'className="flex-1 text-sm font-bold border-2 border-zinc-900 rounded-none px-2 py-1 bg-white text-zinc-900 font-mono focus:outline-none focus:border-pink-500 transition-colors"'
  },
  {
    from: /className="pt-2 border-t border-zinc-100"/g,
    to: 'className="pt-4 border-t-4 border-zinc-900"'
  },
  {
    from: /className="text-\[11px\] font-medium text-zinc-400 uppercase tracking-wider mb-2"/g,
    to: 'className="block text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2"'
  },
  {
    from: /className="p-3 border border-zinc-100 bg-zinc-50"/g,
    to: 'className="p-3 border-2 border-zinc-900 bg-white shadow-[4px_4px_0px_rgba(24,24,27,1)]"'
  },
  {
    from: /className="mx-auto border border-zinc-100 bg-zinc-50 flex items-center justify-center"/g,
    to: 'className="mx-auto border-2 border-zinc-900 bg-white shadow-[4px_4px_0px_rgba(24,24,27,1)] flex items-center justify-center"'
  },
  {
    from: /className="block w-full text-xs border border-zinc-200 px-2 py-1\.5 bg-white text-zinc-800 focus:outline-none focus:border-zinc-400 resize-none font-mono"/g,
    to: 'className="block w-full text-xs font-bold border-2 border-zinc-900 rounded-none px-2 py-1.5 bg-white text-zinc-900 focus:outline-none focus:border-pink-500 transition-colors resize-none font-mono"'
  }
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(rep => {
      content = content.replace(rep.from, rep.to);
    });
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
