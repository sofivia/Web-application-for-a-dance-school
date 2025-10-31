/**
 * @jest-environment jsdom
 */

import React from 'react';
import { expect, test, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import Container from "@/Container.tsx";

type MockProps = {
    stored: string | null,
    prefersDark: boolean
};

function setMocks({ stored, prefersDark }: MockProps) {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((_key: string) => stored);
    console.log("getItem: ", window.localStorage.getItem(""));
    const matchMock = (_qry: string) => ({ matches: prefersDark });
    window.matchMedia = vi.fn().mockImplementation(matchMock);
}

afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = ''
    vi.restoreAllMocks();
});

test('prefers light', () => {
    setMocks({ stored: null, prefersDark: false });
    render(<Container />);
    const container = document.querySelector(".root_container");
    expect(container?.classList.contains("light")).toBe(true);
})

test('prefers dark', () => {
    setMocks({ stored: null, prefersDark: true });
    render(<Container />);
    const container = document.querySelector(".root_container");
    expect(container?.classList.contains("dark")).toBe(true);
})

test('saved overrides preference', () => {
    setMocks({ stored: "dark", prefersDark: false });
    render(<Container />);
    const container = document.querySelector(".root_container");
    expect(container?.classList.contains("dark")).toBe(true);
})

