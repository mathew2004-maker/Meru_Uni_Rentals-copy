import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './PasswordInput.module.css';

function PasswordInput({ id, name, value, onChange, placeholder, required, minLength }) {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        type={show ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={styles.input}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setShow((prev) => !prev)}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default PasswordInput;