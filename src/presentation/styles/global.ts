import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        list-style: none;
        text-decoration: none;
        border: none;
        background: transparent;
        text-align: inherit;
        outline: none;
    }

    a, a:visited, a:hover, a:active {
      color: inherit;
      text-decoration: none;
    }

    html {
        font-size: 62.5%;
        font-family: 'Ubuntu', sans-serif;
    }

    :focus {
        outline: none;
    }

    body {
        background-color: ${({ theme }) => theme.colors.black};
        color: ${({ theme }) => theme.colors.text};
        font-family: ${({ theme }) => theme.font.default};
        font-size: ${({ theme }) => theme.font.sizes.medium};
    }

    &::-moz-focus-inner {
      border: 0;
      padding: 0;
    }
`;
