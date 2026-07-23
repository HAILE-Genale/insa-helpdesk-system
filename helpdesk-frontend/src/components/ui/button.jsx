export function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
