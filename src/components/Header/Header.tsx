import React from 'react';
type HeaderType = {
  title: string;
};
const Header: React.FC<HeaderType> = ({ title }: HeaderType) => {
  return (
    <div
      className="header"
      style={{
        width: '100%',
        height: '64px',
        backgroundColor: 'black',
        color: 'white',
        textAlign: 'center',
        lineHeight: '64px',
        fontSize: '30px',
        fontWeight: 'bold',
      }}
    >
      {title}
    </div>
  );
};
export default Header;
