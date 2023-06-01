async function send(planetId, missionId) {
    const response = await fetch("https://vebinh.lienminh.garena.vn/graphql", {
        headers: {
            accept: "*/*",
            "accept-language": "en",
            "content-type": "application/json",
            "sec-ch-ua":
                '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
        },
        referrer: "https://vebinh.lienminh.garena.vn/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `{\"operationName\":\"claimReward\",\"variables\":{\"planetId\":${planetId},\"missionId\":${missionId}},\"query\":\"mutation claimReward($planetId: Int!, $missionId: Int!) {\\n  claimReward(planetId: $planetId, missionId: $missionId) {\\n    updatedProfile {\\n      id\\n      token\\n      usedToken\\n      mission\\n      noSpecialItemDraws\\n      claimedRewards\\n      ownership\\n      rp\\n      __typename\\n    }\\n    history {\\n      id\\n      source\\n      extra\\n      costStr\\n      itemList {\\n        itemId\\n        category\\n        __typename\\n      }\\n      createdAt\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`,
        method: "POST",
        mode: "cors",
        credentials: "include",
    });
    const data = await response.json();
    const message = data.errors[0].message;
    if (message != "INVALID_ACTION") {
        console.log({ planetId, missionId, message });
    }
}

async function get_user() {
    const response = await fetch("https://vebinh.lienminh.garena.vn/graphql", {
        credentials: "include",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:102.0) Gecko/20100101 Firefox/102.0",
            Accept: "*/*",
            "Accept-Language": "en,en-US;q=0.8,vi-VN;q=0.5,vi;q=0.3",
            "content-type": "application/json",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
        },
        referrer: "https://vebinh.lienminh.garena.vn/",
        body: '{"operationName":"getUser","variables":{},"query":"query getUser {\\n  user: getUser {\\n    id\\n    name\\n    profile {\\n      id\\n      token\\n      usedToken\\n      mission\\n      noSpecialItemDraws\\n      claimedRewards\\n      ownership\\n      rp\\n      __typename\\n    }\\n    currentTime\\n    __typename\\n  }\\n}\\n"}',
        method: "POST",
        mode: "cors",
    });
}

async function run() {
    await send(1, 1);
    await send(1, 9);
    await send(1, 19);
    await send(2, 2);
    await send(2, 10);
    await send(2, 22);
    await send(3, 3);
    await send(3, 11);
    await send(3, 25);
    await send(4, 4);
    await send(4, 12);
    await send(4, 27);
    await send(5, 5);
    await send(5, 13);
    await send(5, 20);
}

run();
