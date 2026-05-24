import { useNavigate } from "react-router-dom";

// ... di dalam komponen LoginAdminPage ...
const navigate = useNavigate();
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const handleLoginAdmin = (e) => {
  e.preventDefault();

  // Gantilah dengan username & password admin yang Anda inginkan
  if (username === "admin" && password === "admin123") {
    
    // 1. Simpan tanda lulus login murni frontend ke localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", "admin");
    localStorage.setItem("token", "bypass-token-admin-murni-frontend");

    // 2. Langsung arahkan masuk ke Dashboard Admin
    navigate("/admin-dashboard");
  } else {
    alert("Username atau Password Admin Salah!");
  }
};