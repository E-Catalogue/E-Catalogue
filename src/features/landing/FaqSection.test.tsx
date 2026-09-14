import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaqSection, SUBANG_CAR_FAQS } from './FaqSection';

describe('FaqSection', () => {
  it('renders all Subang car questions', () => {
    render(<FaqSection companyName="GM Mobilindo" />);

    expect(screen.getByText(/Pertanyaan Seputar Beli Mobil Bekas di Subang/i)).toBeInTheDocument();
    expect(screen.getByText(SUBANG_CAR_FAQS[0].question)).toBeInTheDocument();
    expect(screen.getByText(SUBANG_CAR_FAQS[1].question)).toBeInTheDocument();
  });

  it('toggles accordion open and close on click', () => {
    render(<FaqSection companyName="GM Mobilindo" />);

    const secondQuestionBtn = screen.getByText(SUBANG_CAR_FAQS[1].question);
    fireEvent.click(secondQuestionBtn);

    expect(screen.getByText(SUBANG_CAR_FAQS[1].answer)).toBeInTheDocument();
  });
});
