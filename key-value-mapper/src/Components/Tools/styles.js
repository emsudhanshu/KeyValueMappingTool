const useStyles = () => ({
  root: {
    padding: 16,
    maxWidth: 700,
    margin: '0 auto',
    '& .react-select__control': {
      minHeight: '52px !important',
    },
  },
  list: {
    background: '#fed2d2'
  },
  addKey: {
    background: '#c5f7c5'
  },

  addValue: {
    background: '#d9dcff'
  },
  searchInput: {
    marginBottom: 20,
    padding: '8px 16px',
    border: '1px solid #ccc',
    background: 'white'
  },
  inputField: {
    padding: '9px 16px',
    width: '100%',
    border: '1px solid #ccc',
    flex: 1,
    background: 'white'
  },
  inlineEditInput: {
    border: '1px solid #ccc',
    padding: '4px 8px',
    borderRadius: 4,
  },
  selectBox: {
    width: '100%',
    flex: 1,
    '& .react-select__control': {
      minHeight: 42,
    },
  },
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 300,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    '& .react-select__control': {
      minHeight: '52px !important',
    },
  },
});

export default useStyles;