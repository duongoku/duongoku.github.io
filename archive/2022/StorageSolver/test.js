function test_request_list(request_list, current, begin, end) {
    console.log(`Request list: ${request_list}`);
    console.log(
        `FCFS: ${JSON.stringify(fcfs_seek(request_list.slice(), current))}`
    );
    console.log(
        `SSTF: ${JSON.stringify(sstf_seek(request_list.slice(), current))}`
    );
    console.log(
        `SCAN: ${JSON.stringify(
            scan_seek(request_list.slice(), current, begin, end, false)
        )}`
    );
    console.log(
        `CSCAN: ${JSON.stringify(
            cscan_seek(request_list.slice(), current, begin, end, false)
        )}`
    );
    console.log(
        `LOOK: ${JSON.stringify(
            look_seek(request_list.slice(), current, false)
        )}`
    );
    console.log(
        `CLOOK: ${JSON.stringify(
            clook_seek(request_list.slice(), current, false)
        )}`
    );
}

async function test() {
    const current = 47;
    const begin = 0;
    const end = 320;
    test_request_list(
        [87, 312, 147, 64, 212, 15, 89, 5, 128, 192, 50],
        current,
        begin,
        end
    );
    test_request_list(
        [14, 82, 198, 237, 7, 319, 192, 71, 281, 194, 47],
        current,
        begin,
        end
    );
    test_request_list(
        [89, 303, 78, 298, 132, 14, 93, 147, 249, 152],
        current,
        begin,
        end
    );
    test_request_list([98, 183, 37, 122, 14, 124, 65, 67], current, begin, end);
}

test();
