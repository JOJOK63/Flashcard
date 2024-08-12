import rerollSvg from '../../../public/refresh-line.svg';
import addSvg from '../../../public/add-circle-line.svg';

function Header({ resetCards, onShowVersoChange, showVerso }) {
  return (
    <div className="header h-10vh p-5 border-2 rounded-md flex">
      <div className="w-1/5 flex justify-center items-center add">
        <button className="w-10 h-10">
          <img src={addSvg} alt="icone add" />
        </button>
      </div>
      <div className="w-1/5 flex justify-center items-center uppercase">
        <label htmlFor="list-choice">choisissez une liste</label>
        <select name="list-choice" id="list-choice" className="uppercase ml-2">
          <option value="table-rappel">table de rappel</option>
          <option value="list1">liste 1</option>
          <option value="list2">liste 2</option>
        </select>
      </div>
      <div className="w-1/5 flex justify-center items-center">
        RECTO / VERSO
        <label className="switch ml-2">
          <input
            type="checkbox"
            checked={showVerso}
            onChange={onShowVersoChange}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="w-1/5 flex justify-center items-center">
        injecter un fichier json
      </div>
      <div className="w-1/5 flex justify-center items-center refresh">
        <button className="w-10 h-10" onClick={resetCards}>
          <img src={rerollSvg} alt="icone reset" />
        </button>
      </div>
    </div>
  );
}

export default Header;
