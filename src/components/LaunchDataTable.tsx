import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { LaunchData } from '../types/space-x-data';
import { Alert, Button, TextField, Checkbox } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

function createData(
  name: string,
  success: boolean,
  rocket_name: string,
  launchpad_name: string,
  images: string[],
  details:string,
  launchpad_location: {
    latitude: number;
    longitude: number;
  },
  date_utc:string
) {
  return {
    name,
    success,
    rocket_name,
    launchpad_name,
    images,
    details,
    launchpad_location,
    date_utc
  };
}

function LaunchRow(props: { 
  row: ReturnType<typeof createData>, 
  isOpen: boolean, 
  onToggle: ()=>void 
  isSelected: boolean, 
  onSelect:()=>void
  }) {
  const { row, isOpen, onToggle, isSelected, onSelect } = props;

  const latitude = row.launchpad_location.latitude
  const longitude = row.launchpad_location.longitude

  const staticMapUrl = `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&z=13&size=400,400&l=map&pt=${longitude},${latitude},pm2rdl`;
  
  dayjs.extend(utc);

  const launchDate = dayjs.utc(row.date_utc).format('MMMM D, YYYY');


  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} onChange={onSelect} />
        </TableCell>
        <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{launchDate}</TableCell>
        <TableCell align="right">{row.success?'Success': 'Failure'}</TableCell>
        <TableCell align="right">{row.rocket_name}</TableCell>
        <TableCell align="right">{row.launchpad_name}</TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row" size="small" onClick={onToggle}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="details">
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                       <img height={300} width={300} src={row.images[0]}  alt="Logo" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="h4" gutterBottom component="div">
                        {row.name}
                      </Typography>
                      <Box component="p" style={{fontSize:'17px'}}>
                        {row.details}
                      </Box>
                     <Typography variant="h5" gutterBottom component="div">
                        {row.rocket_name}
                      </Typography>
                      <Box component="p" style={{fontSize:'14px'}}>
                        Launched date: {launchDate}
                      </Box>                      

                      <Typography variant="h5" gutterBottom component="div">
                        {row.launchpad_name}
                      </Typography>
                      <Box component="p" style={{fontSize:'14px'}}>
                        Longitud: {longitude}<br />
                        Latitude: {latitude}
                      </Box>                      
                      </TableCell>
                    <TableCell align="right">
                      <img height={300} width={300} src={staticMapUrl} alt="" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}


type TableProps = {
    data: LaunchData[] | null
}

const LaunchDataTable =({data}: TableProps) => {
  const [openRow, setOpenRow] = React.useState<number | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState<string>('');
  const [sort, setSort] = React.useState<{key: string, direction: 'asc'|'desc'} | null>(null);
  const [selectedRows, setSelectedRows] = React.useState<LaunchData[]>([]);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null; // reset sort
    });
  };
  const handleToggle = (index: number) => {
    setOpenRow(openRow === index ? null : index);
  };


  const handleDateChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

  };

  const handleCreatePDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Launch Report", 14, 20);

  let startY = 30;

  selectedRows.forEach((row, index) => {
    autoTable(doc, {
      head: [], // no global header
      body: [
        ["Name", row.name],
        ["Date", dayjs(row.date_utc).format("YYYY-MM-DD")],
        ["Success", row.success ? "Success" : "Failure"],
        ["Rocket", row.rocket_name],
        ["Launchpad", row.launchpad_name],
        ["Longitude", row.launchpad_location.longitude],
        ["Latitude", row.launchpad_location.latitude],
        ["Details" , row.details]
      ],
      startY: startY,
      theme: "grid",
      styles: { halign: "left" },
      columnStyles: {
        0: { fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });


    const finalY = (doc as any).lastAutoTable.finalY + 10;

    if (finalY > doc.internal.pageSize.height - 40) {
      doc.addPage();
      startY = 20;
    } else {
      startY = finalY;
    }
  });

  doc.save("launches.pdf");
};

  const handleSelectRow = (row: LaunchData) => {
    setSelectedRows((prev) =>
      prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row]
    );
  };

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    setOpenRow(null)
    let result = data.filter((launch) => {
      const nameMatch = launch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const dateString = dayjs(launch.date_utc).format('YYYY-MM-DD');
      const dateMatch = !selectedDate || dateString.includes(selectedDate);
      return nameMatch && dateMatch;
    });

    if (sort) {
      result = [...result].sort((a, b) => {
        const { key, direction } = sort;
        let aValue: any = a[key as keyof LaunchData];
        let bValue: any = b[key as keyof LaunchData];

        // special handling for date
        if (key === 'date_utc') {
          aValue = dayjs(aValue).unix();
          bValue = dayjs(bValue).unix();
        }

        // success is boolean → sort as 0/1
        if (key === 'success') {
          aValue = aValue ? 1 : 0;
          bValue = bValue ? 1 : 0;
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, selectedDate, sort]);
  return (
    <TableContainer component={Paper}  className=" w-full max-w-[1200px]">
      <Box className="" style={{margin:'0 auto', display:"flex", justifyContent:'center',alignItems:'center',padding:"10px",gap:'20px'}}>
        <TextField
          label="launch name"
          variant="standard"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow overflow-visible"
        />
        <div className="calendar" style={{display:"flex",padding:"10px", alignItems:'end', justifyContent:'end' , marginTop:'16px'}}>
            <input
              type="date"
              id="selectedDate"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
        </div>
        
        <Button
          variant="contained"
          onClick={() => {
            setSearchQuery('');
            setSelectedDate('');
          }}
        >
          Limpiar
        </Button>
        <Button variant="contained" color="success" disabled={!selectedRows.length} onClick={handleCreatePDF}>
          Create PDF ({selectedRows.length})
        </Button>
      </Box>
      <Table sx={{minWidth: 650}}  aria-label="collapsible table">
        <TableHead sx={{ bgcolor: 'text.secondary', '& .MuiTableCell-root': { color: 'white' } }}>
          <TableRow>
            <TableCell></TableCell>
            <TableCell onClick={() => handleSort('name')}>
              <Box component="p" style={{fontSize:'14px', display:'flex', justifyContent:'start', alignItems:'center', gap:"10px"}} >
                Name
                {sort?.key === 'name' ? (
                  sort.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                ) : (
                  <UnfoldMoreIcon fontSize="small" />
                )}
              </Box>                      

            </TableCell>
            <TableCell onClick={() => handleSort('date_utc')} align="right">
              <Box component="p" style={{fontSize:'14px', display:'flex', justifyContent:'end', alignItems:'center', gap:"10px"}} >
                Date
                {sort?.key === 'date_utc' ? (
                  sort.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                ) : (
                  <UnfoldMoreIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell onClick={() => handleSort('success')} align="right">
              <Box component="p" style={{fontSize:'14px', display:'flex', justifyContent:'end', alignItems:'center', gap:"10px"}} >
                Success
                {sort?.key === 'success' ? (
                  sort.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                ) : (
                  <UnfoldMoreIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell onClick={() => handleSort('rocket_name')}>
              <Box component="p" style={{fontSize:'14px', display:'flex', justifyContent:'end', alignItems:'center', gap:"10px"}} >
                Rocket
                {sort?.key === 'rocket_name' ? (
                  sort.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                ) : (
                  <UnfoldMoreIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell onClick={() => handleSort('launchpad_name')} align="right">
              <Box component="p" style={{fontSize:'14px', display:'flex', justifyContent:'end', alignItems:'center', gap:"10px"}} >
                Launchpad
                {sort?.key === 'launchpad_name' ? (
                  sort.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                ) : (
                  <UnfoldMoreIcon fontSize="small" />
                )}
              </Box>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredData && filteredData.length ? filteredData.map((launch, index) => 
            <LaunchRow 
              key={index}
              isOpen={openRow === index}
              onToggle={() => handleToggle(index)} 
              row={launch}
              isSelected={selectedRows.includes(launch)}
              onSelect={() => handleSelectRow(launch)}  
            />):
            <Alert severity="warning">
              No hay coincidencias...
            </Alert>
          }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default LaunchDataTable