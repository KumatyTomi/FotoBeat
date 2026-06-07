export default function FileDropzone({
  icon,
  title,
  description,
  accept,
  multiple,
  files,
  onFiles
}) {
  function handleChange(event) {
    const nextFiles = Array.from(event.target.files ?? []);
    onFiles(multiple ? [...files, ...nextFiles] : nextFiles);
  }

  function clearFiles() {
    onFiles([]);
  }

  return (
    <section className="dropzone-card">
      <div className="dropzone-icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>

      <label className="file-picker">
        Wybierz pliki
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
      </label>

      <div className="file-list">
        {files.length === 0 ? (
          <span className="empty-state">Brak plików</span>
        ) : (
          files.slice(0, 6).map((file, index) => (
            <span key={`${file.name}-${index}`}>{file.name}</span>
          ))
        )}
        {files.length > 6 && <span>+ {files.length - 6} więcej</span>}
      </div>

      {files.length > 0 && (
        <button className="clear-button" onClick={clearFiles}>
          Wyczyść
        </button>
      )}
    </section>
  );
}
