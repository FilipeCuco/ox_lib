import { Input } from '@mantine/core';
import { Option } from '../../../typings';

const SearchInput: React.FC<{
  option: [string, Option];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  search: string;
}> = ({ option, handleChange, search }) => {
  const placeholder = option[1].placeholder || 'Search';
  return <Input placeholder={placeholder} onChange={handleChange} value={search} />;
};

export default SearchInput;