import "@testing-library/jest-dom";

function supportRangeDOMRect(): void {
  document.createRange = (): Range => {
    const range = new Range();

    range.getBoundingClientRect = (): DOMRect => ({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON(): Record<string, never> {
        return {};
      },
    });

    range.getClientRects = (): DOMRectList => ({
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn(),
    });

    return range;
  };
}

supportRangeDOMRect();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class FakeDOMRectList extends Array<DOMRect> implements DOMRectList {
  item(index: number): DOMRect | null {
    return this[index];
  }
}

document.elementFromPoint = (): null => null;
