import { Carousel } from 'antd';
import caro1 from '../../../../public/caro1.png';
import caro2 from '../../../../public/caro2.png';
import caro3 from '../../../../public/caro3.png';
import './carousel.css';

function SlideshowCarousel() {
  return (
      <Carousel  autoplay dots effect='scrollx' dotPosition='bottom' pauseOnDotsHover={false} draggable>
        <div className='d-flex justify-content-center carrimage' style={{ userSelect: "none" }}>
          <img
            src={caro1}
            className="carousel-image cursor-pointer"
          />
        </div>
        <div className='d-flex justify-content-center carrimage' style={{ userSelect: "none" }}>
          <img
            src={caro2}
            className="carousel-image cursor-pointer"
          />
        </div>
        <div className='d-flex justify-content-center carrimage' style={{ userSelect: "none" }}>
          <img
            src={caro3}
            className="carousel-image cursor-pointer"
          />
        </div>
      </Carousel>
  );
}

export default SlideshowCarousel;
