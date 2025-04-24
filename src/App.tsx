import {
  forwardRef,
  UIEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import "./App.css";
import times from "lodash.times";

const data = times(1000000);

const PAGE_SIZE = 5;
const CARD_HEIGHT_PX = 150;
const GAP_SIZE_PX = 16;

// gives me the multiple rounded up to nearest whole.
// but since page is an index, we subtrac 1.
const MAX_PAGE = Math.ceil(data.length / PAGE_SIZE) - 1;

function App() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const pageData = useMemo(() => {
    const startIdx = page * PAGE_SIZE;
    const endIdx = Math.min((page + 1) * PAGE_SIZE, data.length);
    return data.slice(startIdx, endIdx);
  }, [page]);

  useEffect(() => {
    if (page > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = getBufferPx(page);
    }
  }, [page]);

  return (
    <div className="app">
      <div className="mb-4">
        <h1 style={{ marginBottom: 0 }}>Infinite scroll</h1>
        <span>page: {page}</span>
      </div>
      <ScrollContainer
        ref={scrollRef}
        onScroll={(e) => {
          const { scrollHeight, scrollTop } = e.currentTarget;

          if (
            page < MAX_PAGE &&
            scrollTop + getScrollContainerHeight(PAGE_SIZE - 1) >= scrollHeight
          ) {
            setPage(page + 1);
          } else if (page > 0 && scrollTop < getBufferPx(page)) {
            setPage(page - 1);
          }

          // if i'm at the last one, load the next round
        }}
      >
        {pageData.map((d, idx) => (
          <Card key={d} isFirst={idx === 0} page={page}>
            {d}
          </Card>
        ))}
      </ScrollContainer>
      <div className="flex gap-4 mt-4">
        <button
          disabled={page === 0}
          onClick={() => setPage(Math.max(page - 1, 0))}
        >
          {"< prev page"}
        </button>
        <button
          disabled={page === MAX_PAGE}
          onClick={() => setPage(Math.min(page + 1, MAX_PAGE))}
        >
          {"next page > "}
        </button>
      </div>
    </div>
  );
}

const getBufferPx = (page: number) => {
  return (
    page * PAGE_SIZE * CARD_HEIGHT_PX +
    page * Math.max(PAGE_SIZE - 1, 0) * GAP_SIZE_PX
  );
};

const getScrollContainerHeight = (pageSize: number) => {
  return CARD_HEIGHT_PX * pageSize + GAP_SIZE_PX * pageSize - 1;
};

const Card: FC<{
  isFirst?: boolean;
  page: number;
  children?: ReactNode;
}> = ({ isFirst, page, children }) => {
  return (
    <div
      style={{
        marginTop: isFirst ? getBufferPx(page) : GAP_SIZE_PX,
        boxSizing: "border-box",
        border: "1px solid black",
        padding: "1rem",
        height: CARD_HEIGHT_PX,
      }}
    >
      {children}
    </div>
  );
};

const ScrollContainer = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    onScroll?: UIEventHandler<HTMLDivElement>;
  }
>(({ children, onScroll }, ref) => {
  return (
    <div
      onScroll={onScroll}
      ref={ref}
      style={{
        // height of the container is only N-1 cards
        height: getScrollContainerHeight(PAGE_SIZE - 1),
        overflow: "auto",
        backgroundColor: "#eeeded99",
      }}
    >
      {children}
    </div>
  );
});

export default App;
