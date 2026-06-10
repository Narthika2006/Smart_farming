import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddFarmModal from "../components/AddFarmModal";

function AddFarm() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    navigate("/farms");
  }, [navigate]);

  return (
    <AddFarmModal
      isOpen={isOpen}
      onClose={handleClose}
      onFarmAdded={handleClose}
    />
  );
}

export default AddFarm;
