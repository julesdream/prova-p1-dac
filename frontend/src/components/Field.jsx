/** Campo de formulário com rótulo. Repassa as demais props para o <input>. */
export default function Field({ label, ...inputProps }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...inputProps} />
    </label>
  );
}
