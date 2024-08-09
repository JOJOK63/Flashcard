import './App.css'
import addSvg from '../public/add-circle-line.svg';
import Card from './components/card/Card';
function App() {

  const cardsData = [
    {
      id: "0",
      title: "Beautiful Landscape",
      img: "https://example.com/images/landscape.jpg"
    },
    {
      id: "1",
      title: "Beautiful Landscape",
      img: "https://example.com/images/landscape.jpg"
    },
    {
      id: "2",
      title: "Sunset at the Beach",
      img: "https://example.com/images/sunset-beach.jpg"
    },
    {
      id: "3",
      title: "Mountain Adventure",
      img: "https://example.com/images/mountain-adventure.jpg"
    },
    {
      id: "4",
      title: "City Skyline",
      img: "https://example.com/images/city-skyline.jpg"
    },
    {
      id: "5",
      title: "Forest Path",
      img: "https://example.com/images/forest-path.jpg"
    },
    {
      id: "6",
      title: "Desert Dunes",
      img: "https://example.com/images/desert-dunes.jpg"
    },
    {
      id: "7",
      title: "Snowy Mountains",
      img: "https://example.com/images/snowy-mountains.jpg"
    },
    {
      id: "8",
      title: "Tropical Island",
      img: "https://example.com/images/tropical-island.jpg"
    },
    {
      id: "9",
      title: "Countryside Field",
      img: "https://example.com/images/countryside-field.jpg"
    },
    {
      id: "10",
      title: "River Bend",
      img: "https://example.com/images/river-bend.jpg"
    },
    {
      id: "11",
      title: "Golden Desert",
      img: "https://example.com/images/golden-desert.jpg"
    },
    {
      id: "12",
      title: "Foggy Forest",
      img: "https://example.com/images/foggy-forest.jpg"
    },
    {
      id: "13",
      title: "Ocean Waves",
      img: "https://example.com/images/ocean-waves.jpg"
    },
    {
      id: "14",
      title: "Starry Night",
      img: "https://example.com/images/starry-night.jpg"
    },
    {
      id: "15",
      title: "Autumn Leaves",
      img: "https://example.com/images/autumn-leaves.jpg"
    },
    {
      id: "16",
      title: "Winter Wonderland",
      img: "https://example.com/images/winter-wonderland.jpg"
    },
    {
      id: "17",
      title: "Spring Blossoms",
      img: "https://example.com/images/spring-blossoms.jpg"
    },
    {
      id: "18",
      title: "Summer Fields",
      img: "https://example.com/images/summer-fields.jpg"
    },
    {
      id: "19",
      title: "Urban Jungle",
      img: "https://example.com/images/urban-jungle.jpg"
    },
    {
      id: "20",
      title: "Island Escape",
      img: "https://example.com/images/island-escape.jpg"
    }
  ];
  

  return (
    <>
      <div className='header bg-orange-500 h-10vh p-5' >
        <div>
          <button><img src={addSvg} alt="" /></button>
        </div>
        <div>

        </div>
        <div>

        </div>
        <div>

        </div>
      </div>

      <div className="main bg-lime-700 w-full h-auto p-10 grid grid-cols-10 gap-5 ">

      {cardsData.map((card) => (
          <Card key={card.id} id={card.id} img={card.img} title={card.title} />
        ))}

      </div>

    </>
  )
}

export default App
