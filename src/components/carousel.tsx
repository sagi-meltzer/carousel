import { Button, Box, Menu, MenuItem, Checkbox, FormControlLabel, Collapse } from "@mui/material";
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import React, { useEffect, useMemo } from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

type Tax = {
  countryCode: number; // Example: 1, 2, 3...
  taxRuleName: string; // Example: "Rule A", "Rule B"...
}

type Grant = {
  stakeholderName: string; // Example: "Aki Avni"
  taxRules: Tax[];
}

type CountryFlags = {
    [key: string]: {
      flag: string;
      name: string;
    };
  };
  
const countryFlags: CountryFlags = {
    1: { flag: 'https://flagicons.lipis.dev/flags/4x3/au.svg', name: 'Australia' },
    2: { flag: 'https://flagicons.lipis.dev/flags/4x3/br.svg', name: 'Brazil' },
    3: { flag: 'https://flagicons.lipis.dev/flags/4x3/ca.svg', name: 'Canada' }
}

const MOCK_DATA: Grant[] = [
  {
    stakeholderName: "Aki Avni",
    taxRules: [
      {
        countryCode: 1,
        taxRuleName: "Rule A"
      },
      {
        countryCode: 2,
        taxRuleName: "Rule B"
      }
    ]
  },
  {
    stakeholderName: "Allan de Neergaard",
    taxRules: [
      {
        countryCode: 3,
        taxRuleName: "Rule C"
      }
    ]
  }
]

function groupByCountryCode(data: Grant[]): Record<number, Grant[]> {
    return data.reduce((acc, item) => {
      item.taxRules.forEach(taxRule => {
        if (!acc[taxRule.countryCode]) {
          acc[taxRule.countryCode] = [];
        }
        acc[taxRule.countryCode].push(item);
      });
      return acc;
    }, {} as Record<number, Grant[]>);
  }

  type HeaderProps = {
    selected: Grant | undefined;
    grants: Grant[];
    onClick: (event: React.MouseEvent<HTMLElement>) => void;
    onSelect: React.Dispatch<React.SetStateAction<Grant | undefined>>;
};


const Header = ({ selected, grants, onClick, onSelect }: HeaderProps) => {
    const index = selected ? grants.indexOf(selected) : -1;
    return (
        <div>
            <Button
                size='small'
                disabled={grants.length === 0 || index === 0}
                onClick={() => onSelect(index > 0 ? grants[index - 1] : grants[grants.length - 1])}
            >
                <KeyboardArrowLeft />
            </Button>
            <Button variant="text" size='small' onClick={onClick}>{selected?.stakeholderName} - {index + 1}/{grants.length}</Button>
            <Button
                size='small'
                disabled={grants.length === 0 || index === grants.length - 1}
                onClick={() => onSelect(index < grants.length - 1 ? grants[index + 1] : grants[0])}
            >
                <KeyboardArrowRight />
            </Button>
        </div>
    );
}

const Carousel = ({data = MOCK_DATA}: {data?: Grant[]}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [countryOpenStates, setCountryOpenStates] = React.useState<{ [key: string]: boolean }>({  });
    const [selectedGrant, setSelectedGrant] = React.useState<Grant>();
    const [checkedState, setCheckedState] = React.useState<{ [key: string]: boolean }>({});
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleMenuItemCheck = (country: string) => {
        setCheckedState(prevState => ({
            ...prevState,
            [country]: !prevState[country] 
        }));
    };

    const handleCountryClick = (country: string) => {
        setCountryOpenStates(prevState => ({
            ...prevState,
            [country]: !prevState[country] 
        }));
    };
    const groupByCountry = useMemo<Record<number, Grant[]>>(() => groupByCountryCode(data), [data]);
    const _checkedGrants = useMemo(() => {
        const checkedGrants: Set<Grant> = new Set();
        Object.keys(checkedState).forEach((country) => {
            if (checkedState[country]) {
                groupByCountry[parseInt(country)].forEach(grant => checkedGrants.add(grant));
            }
        });
        return checkedGrants as unknown  as Grant[]
    }, [checkedState, groupByCountry]);

    const isAllChecked = Object.values(checkedState).every(Boolean) && Object.keys(checkedState).length > 0;
    const isIndeterminate = Object.values(checkedState).some(Boolean) && !isAllChecked;
    const checkUncheckAll = () => {
        const updatedCheckedState: { [key: string]: boolean } = {};
        Object.keys(groupByCountry).forEach((country) => {
            updatedCheckedState[country] = !isAllChecked;
        });

        setCheckedState(updatedCheckedState);
    }

    const checkedGrants = [..._checkedGrants];

    useEffect(() => {
        setSelectedGrant([...checkedGrants].length > 0 ? checkedGrants.values().next().value : undefined);
    }, [checkedState])

    return <Box sx={{ maxWidth: 400, flexGrow: 1 }}>
        <Header selected={selectedGrant} grants={checkedGrants} onClick={handleClick} onSelect={setSelectedGrant}/>
        <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem  > 
            <FormControlLabel
            label="All Award Letters"
            control={
                <Checkbox
                checked={isAllChecked}
                indeterminate={isIndeterminate}
                onChange={checkUncheckAll}/>
            }/>
        </MenuItem>
        {
            Object.entries(groupByCountry).map(([country, grants], index) => [
                <MenuItem key={country + checkedState[country]} onClick={() => handleCountryClick(country)} sx={{ display: 'flex', justifyContent: 'space-between'}}>
                    <FormControlLabel
                        label={countryFlags[country].name}
                        control={<Checkbox onChange={() => handleMenuItemCheck(country)} checked={checkedState[country]}/>}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                        <img src={countryFlags[country].flag} alt={countryFlags[country].name} width={20} height={15} />
                        {countryOpenStates[country] ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                </MenuItem>,
                <Collapse in={countryOpenStates[country]} timeout="auto" unmountOnExit>
                    {grants.map((grant, index) => (
                            <MenuItem key={country + grant.stakeholderName}>{grant.stakeholderName}</MenuItem>
                    ))}
                </Collapse>
            ])
        }
      </Menu>
    </Box>
}

export default Carousel