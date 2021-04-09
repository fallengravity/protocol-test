<template>
  <div>
    <div class="row">
      <div
        v-for="item in items"
        :key="item.itemData.id"
        class="my-card col-4"
      >
        <q-card
          style="margin: 2%; -webkit-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75); -moz-box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75); box-shadow: 10px 10px 5px 0px rgba(0, 0, 0, 0.75);"
          flat
          bordered
        >
          <q-img
            class="img-center"
            style="height: 156px; width: 156px; margin: 2%; display: block; margin-left: auto; margin-right: auto;"
            :src="'https://ipfs.io/' + item.metadata.properties.image.split('ipfs://').join('')"
            borderd
          />

          <q-card-section>
            <div class="text-h5 q-mt-sm q-mb-xs">
              {{ item.metadata.properties.name }}
            </div>
            <div class="text-caption text-grey">
              {{ item.metadata.properties.description }}
            </div>
          </q-card-section>

          <q-card-actions align="around">
            <q-btn
              style="background-color: #101010;"
              icon="fas fa-shopping-basket"
              label="Purchase"
              @click="createSale(item.itemData.tokenId)"
            />
            <q-btn
              style="background-color: #101010;"
              icon="fas fa-info-circle"
              :to="{name: 'Item' , params:{ id: item.itemData.id }}"
              label="View Details"
            />

            <q-btn
              color="grey"
              round
              flat
              dense
              :icon="expanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              @click="expanded = !expanded"
            />
          </q-card-actions>

          <!--<q-slide-transition>
            <div v-show="expanded">
              <q-separator />
              <q-card-section class="text-subitle2">
                Creator: {{ product.creator_address }}
                <hr>
                Created at Block: {{ product.blockHeight }}
              </q-card-section>
            </div>
          </q-slide-transition>-->
        </q-card>
        <router-link to="Create">
          <q-btn label="Create" />
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageIndex',
  data() {
    return {
      items: [],
      expanded: false,
      usdValue: 1,
    };
  },
  mounted() {
    this.$q.dark.set(true);
    this.getItems();
  },
  methods: {
    async getItems() {
      this.$axios.get('https://niftily-api.herokuapp.com/items').then((result) => {
        this.items = result.data.reverse();
        console.log(this.items);
      });
    },
    createSale(itemId) {
      const domainData = {
        name: 'My amazing dApp',
        version: '2',
        chainId: 4,
        verifyingContract: '0x43162023C187662684abAF0b211dCCB96fa4eD8a',
        salt: '0x0000000000000000000000000000000000000000000000000000000000000601',
      };
      const domain = [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ];
      const bid = [
        { name: 'amount', type: 'uint256' },
        { name: 'bidder', type: 'Identity' },
      ];
      const identity = [
        { name: 'userId', type: 'uint256' },
        { name: 'wallet', type: 'address' },
      ];

      const sale = JSON.stringify({
        type: 'RARIBLE_V2',
        maker: this.$API.userAccount[0],
        make: {
          assetType: {
            '@type': 'ERC721',
            token: '0x25646B08D9796CedA5FB8CE0105a51820740C049',
            tokenId: itemId,
          },
          value: 1,
        },
        take: {
          assetType: {
            assetClass: 'ETH',
          },
          value: 100000000,
        },
        salt: '0x0000000000000000000000000000000000000000000000000000000000000601',
        start: 0,
        end: 0,
        data: {
          dataType: 'LEGACY',
          fee: 0.5,
        },
      });

      const data = JSON.stringify({
        types: {
          EIP712Domain: domain,
          Bid: bid,
          Identity: identity,
        },
        domain: domainData,
        primaryType: 'Bid',
        message: sale,
      });
      const from = this.$API.userAccount[0];
      this.$API.web3.currentProvider.sendAsync({
        method: 'eth_signTypedData_v3',
        params: [from, data],
        from,
      // eslint-disable-next-line consistent-return
      }, (err, result) => {
        if (err) {
          return console.error(err);
        }
        const signature = result.result.substring(2);
        const r = `0x${signature.substring(0, 64)}`;
        const s = `0x${signature.substring(64, 128)}`;
        const v = parseInt(signature.substring(128, 130), 16);
        console.log(r, s, v);
        const saleSigned = JSON.parse(sale);
        saleSigned.signature = `0x${signature}`;
        console.log(saleSigned);
        this.$axios.post('http://api-staging.rarible.com/protocol/v0.1/ethereum/order/orders', saleSigned).then((results) => {
          console.log(results);
        }).catch((error) => {
          console.log(error);
        });
      });
    },
  },
};
</script>
