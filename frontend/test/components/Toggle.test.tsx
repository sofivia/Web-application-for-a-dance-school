/**
 * @jest-environment jsdom
 */

import React from 'react';
import { expect, test, vi } from 'vitest';
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
