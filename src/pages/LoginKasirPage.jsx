import { useNavigate } from "react-router-dom";

// ... di dalam komponen LoginKasirPage ...
const navigate = useNavigate();
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const handleLoginKasir = (e) => {
  e.preventDefault();

  // Gantilah "kasir1" dan "kasir123" dengan username & password sesuka Anda
  if (username === "kasir" && password === "kasir123") {
    
    // 1. Simpan tanda lulus login murni frontend ke localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", "kasir");
    localStorage.setItem("token", "bypass-token-kasir-murni-frontend");

    // 2. Langsung arahkan masuk ke Dashboard Utama Kasir Hub
    navigate("/kasir-dashboard");
  } else {
    alert("Username atau Password Kasir Salah!");
  }
};