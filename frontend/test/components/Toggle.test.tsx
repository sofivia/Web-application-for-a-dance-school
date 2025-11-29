/**
 * @jest-environment jsdom
 */

import React from 'react';
import { useId } from 'react';
import { expect, test, vi, Mock } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import Toggle from "@/components/Toggle.tsx";

test('test toggle callback', () => {
    const cb = vi.fn();
    const { getByRole } = render(<Toggle callback={cb} isOn={true} />);
    const toggle = getByRole("button");
    expect(cb).not.toHaveBeenCalled();
    fireEvent.click(toggle);
    expect(cb).toHaveBeenCalled();
})

test('test toggle id', () => {
    const id = 'test-id';
    const { getByLabelText } = render(
        <>
            <label htmlFor={id}> test-label </label>
            <Toggle callback={() => { }} isOn={true} id={id} />
        </>
    );
    const toggle = getByLabelText("test-label");
    expect(toggle.id == id);
})

test('test toggle id', () => {
    vi.mock(import('react'), () => {
        return {
            useId: vi.fn()
        }
    });
    const id = 'test-id';
    const useIdMock = useId as Mock;
    useIdMock.mockReturnValue(id);

    const { getByLabelText } = render(
        <>
            <label htmlFor={id}> test-label </label>
            <Toggle callback={() => { }} isOn={true} />
        </>
    );
    const toggle = getByLabelText("test-label");
    expect(toggle.id == id);
})