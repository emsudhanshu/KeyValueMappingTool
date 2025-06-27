const useStyles = () => ({
  root: {
    padding: '24px',
    maxWidth: '100vw',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Roboto, sans-serif',
    '& .react-select__control': {
      height: '54px !important'
    },
    '& input': {
      background: 'white',
      paddingLeft: '10px'
    }

  },

  sectionBox: {
    width: '250px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    padding: '20px',
    marginBottom: '20px',
  },

  searchInput: {
    padding: '10px 14px',
    fontSize: '16px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    width: '100%'
  },

  inputField: {
    padding: '10px 14px',
    fontSize: '16px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    width: '100%',
  },

  inlineEditInput: {
    padding: '8px 12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    backgroundColor: '#fff',
  },

  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 350,
    backgroundColor: '#fff',
    padding: 24,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
    '& .react-select__control': {
      minHeight: '48px !important',
    },
  },

  paperItem: {
    padding: 4,
    marginBottom: 12,
    border: '1px solid #e0e0e0',
    backgroundColor: '#ffffff',
  },

  keyHeader: {
    paddingBottom: 0,
    cursor: 'pointer',
  },

  addKeyBox: {
    backgroundColor: '#e8f5e9',
    border: '1px solid #81c784',
  },

  addValueBox: {
    backgroundColor: '#e3f2fd',
    border: '1px solid #64b5f6',
  },

  tableSearchBox: {
    paddingBottom: '20px',
  },

  tableDropdown: {
    maxHeight: '300px',
    overflowY: 'scroll',
    padding: '20px',
    zIndex: 200,
    position: 'relative'
  }
});

export default useStyles;
