export default function Loader({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} border-2 border-dark-500 border-t-brand-500 rounded-full animate-spin`}
      />
      {text && <p className="text-dark-300 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-bold text-brand-400">Tech4um</div>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}
